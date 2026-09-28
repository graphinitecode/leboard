'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'

import { Button, InsetText, Panel, WarningText } from '@/components/atoms'
import { Combobox, ErrorSummary, Radios, type ComboboxOption } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import {
  joursDeRetard,
  useEnregistrerPret,
  useListCatalogue,
  useListPretsEnCours,
} from '@/bibliotheque'
import { nomEleve, useListElevesDuProf } from '@/students'

type Etape = 1 | 2 | 3 | 4 | 5

// Copie figée à l'ajout : les invalidations des POST (catalogue, prêts)
// ne vident pas la sélection pendant l'enregistrement.
type LivreChoisi = {
  exemplaireId: number
  livreId: number
  titre: string
  auteur: string | null
  code: string
}

type Echec = { titre: string; message: string }

const DUREES = [
  { value: '2s', jours: 14, mois: 0, label: 'Dans 2 semaines' },
  { value: '3s', jours: 21, mois: 0, label: 'Dans 3 semaines' },
  { value: '1m', jours: 0, mois: 1, label: 'Dans 1 mois' },
] as const

type Duree = (typeof DUREES)[number]['value']

// Échecs qui invalident le mot de passe (401/423/403) : la boucle de POST
// s'arrête net — pas la peine de refuser les livres suivants à l'auth.
const ERREUR_AUTH = /mot de passe|tentative|verrouill|gestionnaires/i

// La date ISO est calculée au moment de l'enregistrement (pas au rendu) :
// pas de décalage si la page reste ouverte.
const dateRetourIso = (duree: Duree): string => {
  const preset = DUREES.find((d) => d.value === duree) ?? DUREES[0]
  const date = new Date()
  if (preset.mois > 0) {
    date.setMonth(date.getMonth() + preset.mois)
  } else {
    date.setDate(date.getDate() + preset.jours)
  }
  return date.toISOString()
}

const formatDateCourte = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })

const formatDateLongue = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

// Assistant « un prêt en 4 questions » (pattern GOV.UK question pages) :
// élève → livres (recherche, sélection multiple) → date de retour → récap.
// Chaque livre donne 1 prêt : boucle séquentielle, le plafond de prêts et
// la disponibilité restent arbitrés côté serveur, livre par livre. Un livre
// en échec n'empêche pas les autres (échec d'authentification excepté).
export default function NouveauPretView({ profId }: { profId: number }) {
  const catalogue = useListCatalogue()
  const eleves = useListElevesDuProf(profId)
  const enregistrer = useEnregistrerPret()

  const [etape, setEtape] = useState<Etape>(1)
  const [eleveId, setEleveId] = useState<number | null>(null)
  const [livresChoisis, setLivresChoisis] = useState<LivreChoisi[]>([])
  const [duree, setDuree] = useState<Duree>('2s')
  const [erreur, setErreur] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const [resultats, setResultats] = useState<{ enregistres: number; echecs: Echec[] }>({
    enregistres: 0,
    echecs: [],
  })
  const [dateRetourPrevue, setDateRetourPrevue] = useState<string | null>(null)

  const eleveChoisi = (eleves.data ?? []).find((e) => e.id === eleveId) ?? null
  const nomEleveChoisi = eleveChoisi ? nomEleve(eleveChoisi) : null
  const sousTitreEleve = eleveChoisi
    ? [eleveChoisi.niveau, eleveChoisi.groupe].filter(Boolean).join(' · ')
    : null

  // Avertissement non bloquant : livres toujours en retard chez cet élève.
  // Requête absente (chargement ou erreur) → pas d'avertissement, flux intact.
  const pretsEleve = useListPretsEnCours({ eleveId: eleveId ?? undefined })
  const retards = (pretsEleve.data ?? []).filter((p) => joursDeRetard(p.dateRetourPrevue) > 0)
  const phraseRetards =
    eleveChoisi && retards.length > 0
      ? `${nomEleveChoisi} a déjà ${retards.length} livre${retards.length > 1 ? 's' : ''} en retard : ${retards
          .map((p) => (p.livreLabel ? `« ${p.livreLabel} »` : 'un livre'))
          .join(', ')}`
      : null

  const optionsEleves = useMemo<ComboboxOption<number>[]>(
    () =>
      (eleves.data ?? []).map((eleve) => ({
        id: `eleve-${eleve.id}`,
        label: nomEleve(eleve),
        sublabel: [eleve.niveau, eleve.groupe].filter(Boolean).join(' · '),
        value: eleve.id,
      })),
    [eleves.data],
  )

  const aucunExemplaireDisponible = (catalogue.data ?? []).every((livre) =>
    livre.exemplaires.every((ex) => !ex.disponible),
  )

  const optionsLivres = useMemo<ComboboxOption<number>[]>(
    () =>
      (catalogue.data ?? []).map((livre) => {
        const exemplaireDispo = livre.exemplaires.find((ex) => ex.disponible) ?? null
        const dejaChoisi = livresChoisis.some((l) => l.livreId === livre.id)
        return {
          id: `livre-${livre.id}`,
          label: livre.titre,
          sublabel: [
            livre.auteur,
            livre.isbn,
            exemplaireDispo ? 'disponible' : 'indisponible (emprunté)',
          ]
            .filter(Boolean)
            .join(' · '),
          disabled: !exemplaireDispo || dejaChoisi,
          value: livre.id,
        }
      }),
    [catalogue.data, livresChoisis],
  )

  const ajouterLivre = (option: ComboboxOption<number>) => {
    const livre = (catalogue.data ?? []).find((l) => l.id === option.value)
    const exemplaire = livre?.exemplaires.find((ex) => ex.disponible)
    if (!livre || !exemplaire) return
    setErreur([])
    setLivresChoisis((prev) =>
      prev.some((l) => l.livreId === livre.id)
        ? prev
        : [
            ...prev,
            {
              exemplaireId: exemplaire.id,
              livreId: livre.id,
              titre: livre.titre,
              auteur: livre.auteur,
              code: exemplaire.code,
            },
          ],
    )
  }

  const retirerLivre = (livreId: number) =>
    setLivresChoisis((prev) => prev.filter((l) => l.livreId !== livreId))

  const titresEnLigne = (
    <>
      {livresChoisis.map((livre) => (
        <span key={livre.livreId} style={{ display: 'block' }}>
          {livre.titre}
        </span>
      ))}
    </>
  )

  const reinitialiser = () => {
    setEtape(1)
    setEleveId(null)
    setLivresChoisis([])
    setDuree('2s')
    setErreur([])
    setResultats({ enregistres: 0, echecs: [] })
    setDateRetourPrevue(null)
  }

  // Boucle séquentielle (pas de Promise.all : disponibilité et plafond sont
  // vérifiés serveur à chaque POST). Échec métier (422 ex. plafond) : le
  // livre est noté, la boucle continue. Échec d'auth : arrêt immédiat.
  async function enregistrerPret(motDePasse: string) {
    if (!eleveChoisi || livresChoisis.length === 0 || pending) return
    const dateRetour = dateRetourIso(duree)
    let nbEnregistres = 0
    const echecs: Echec[] = []
    let echecAuth = false

    setDateRetourPrevue(dateRetour)
    setErreur([])
    setPending(true)
    try {
      for (const livre of livresChoisis) {
        try {
          await enregistrer.mutateAsync({
            eleveId: eleveChoisi.id,
            exemplaireId: livre.exemplaireId,
            motDePasse,
            dateRetourPrevue: dateRetour,
          })
          nbEnregistres += 1
          const livreId = livre.livreId
          setLivresChoisis((prev) => prev.filter((l) => l.livreId !== livreId))
        } catch (err) {
          const message = err instanceof Error ? err.message : "Le prêt n'a pas pu être enregistré."
          echecs.push({ titre: livre.titre, message })
          if (ERREUR_AUTH.test(message)) {
            echecAuth = true
            break
          }
        }
      }
    } finally {
      setPending(false)
      setConfirmOuvert(false)
    }

    if (echecAuth) {
      setErreur([echecs[echecs.length - 1].message])
      setResultats({ enregistres: 0, echecs: [] })
      return
    }
    if (echecs.length > 0) {
      setErreur(echecs.map((e) => `« ${e.titre} » : ${e.message}`))
    }
    setResultats({ enregistres: nbEnregistres, echecs })
    if (echecs.length === 0) {
      setEtape(5)
    }
  }

  return (
    <div className="lpv-container">
      {etape === 1 && (
        <QuestionPage
          actions={
            <Button
              onClick={() => {
                if (!eleveChoisi) {
                  setErreur(["Choisis l'élève qui emprunte"])
                  return
                }
                setErreur([])
                setEtape(2)
              }}
              type="button"
            >
              Continuer
            </Button>
          }
          question="Quel élève emprunte ?"
          retour={{ href: '/profs/bibliotheque', label: 'Retour à la bibliothèque' }}
          step={1}
          stepSize={4}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          {eleves.isLoading ? (
            <p className="lpv-muted">Chargement des élèves…</p>
          ) : (eleves.data ?? []).length === 0 ? (
            <p className="lpv-muted">Aucun élève relié à votre compte.</p>
          ) : eleveChoisi ? (
            <div className="lpv-m-combobox__selection">
              <div className="lpv-m-combobox__selection-label">{nomEleveChoisi}</div>
              {sousTitreEleve ? (
                <div className="lpv-m-combobox__selection-sub">{sousTitreEleve}</div>
              ) : null}
              <Button
                onClick={() => {
                  setEleveId(null)
                  setErreur([])
                }}
                type="button"
                variant="secondary"
              >
                Changer
              </Button>
            </div>
          ) : (
            <Combobox
              hint="Tape un prénom ou un nom."
              id="pret-eleve"
              label="Élève"
              onChange={(option) => {
                setErreur([])
                setEleveId(option.value)
              }}
              options={optionsEleves}
              placeholder="Prénom ou nom…"
            />
          )}
          {phraseRetards && <WarningText>{phraseRetards}.</WarningText>}
        </QuestionPage>
      )}

      {etape === 2 && (
        <QuestionPage
          actions={
            <Button
              onClick={() => {
                if (livresChoisis.length === 0) {
                  setErreur(['Ajoute au moins un livre'])
                  return
                }
                setErreur([])
                setEtape(3)
              }}
              type="button"
            >
              Continuer
            </Button>
          }
          question={
            nomEleveChoisi ? `Quels livres emprunte ${nomEleveChoisi} ?` : 'Quels livres emprunter ?'
          }
          reponses={
            nomEleveChoisi
              ? [{ question: 'Élève', valeur: nomEleveChoisi, onClick: () => setEtape(1) }]
              : []
          }
          retour={{
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              setErreur([])
              setEtape(1)
            },
          }}
          step={2}
          stepSize={4}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          {catalogue.isLoading ? (
            <p className="lpv-muted">Chargement du catalogue…</p>
          ) : aucunExemplaireDisponible ? (
            <p className="lpv-muted">Aucun exemplaire disponible pour le moment.</p>
          ) : (
            <>
              <Combobox
                hint="Cherche par titre, auteur ou ISBN. Tu peux en ajouter plusieurs."
                id="pret-livre"
                label="Livres"
                noResultsLabel="Aucun livre trouvé"
                onChange={ajouterLivre}
                options={optionsLivres}
                placeholder="Titre, auteur ou ISBN…"
              />
              {livresChoisis.length > 0 && (
                <div className="lpv-m-combobox__selection-list">
                  {livresChoisis.map((livre) => (
                    <div className="lpv-m-combobox__selection" key={livre.livreId}>
                      <div className="lpv-m-combobox__selection-label">{livre.titre}</div>
                      {[livre.auteur, `exemplaire ${livre.code}`].filter(Boolean).length > 0 && (
                        <div className="lpv-m-combobox__selection-sub">
                          {[livre.auteur, `exemplaire ${livre.code}`].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      <Button onClick={() => retirerLivre(livre.livreId)} type="button" variant="secondary">
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </QuestionPage>
      )}

      {etape === 3 && (
        <QuestionPage
          actions={
            <Button
              onClick={() => {
                setErreur([])
                setEtape(4)
              }}
              type="button"
            >
              Continuer
            </Button>
          }
          question="Quand le livre doit-il être rendu ?"
          reponses={[
            { question: 'Élève', valeur: nomEleveChoisi ?? '—', onClick: () => setEtape(1) },
            {
              question: 'Livres',
              valeur: livresChoisis.length > 0 ? titresEnLigne : '—',
              onClick: () => setEtape(2),
            },
          ]}
          retour={{
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              setErreur([])
              setEtape(2)
            },
          }}
          step={3}
          stepSize={4}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          <Radios
            hint="La durée habituelle est de 2 semaines."
            idPrefix="duree-retour"
            name="Durée du prêt"
            onChange={(e) => setDuree(e.target.value as Duree)}
            options={DUREES.map((d) => ({
              value: d.value,
              label: d.label,
              hint: formatDateCourte(dateRetourIso(d.value)),
            }))}
            value={duree}
          />
        </QuestionPage>
      )}

      {etape === 4 && (
        <QuestionPage
          actions={
            <Button disabled={pending} onClick={() => setConfirmOuvert(true)} type="button">
              Enregistrer le prêt
            </Button>
          }
          question="Vérifiez et validez"
          retour={{
            href: '#',
            onClick: (e) => {
              e.preventDefault()
              setErreur([])
              setEtape(3)
            },
          }}
          step={4}
          stepSize={4}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          <QuestionPageAnswers
            reponses={[
              { question: 'Élève', valeur: nomEleveChoisi ?? '—', onClick: () => setEtape(1) },
              {
                question: 'Livres',
                valeur: livresChoisis.length > 0 ? titresEnLigne : '—',
                onClick: () => setEtape(2),
              },
              {
                question: 'Retour prévu',
                valeur: formatDateLongue(dateRetourIso(duree)),
                onClick: () => setEtape(3),
              },
            ]}
            titre="Récapitulatif"
          />
          {resultats.enregistres > 0 && resultats.echecs.length > 0 && (
            <InsetText>
              {resultats.enregistres} livre{resultats.enregistres > 1 ? 's' : ''} sur{' '}
              {resultats.enregistres + resultats.echecs.length} enregistré
              {resultats.enregistres + resultats.echecs.length > 1 ? 's' : ''}.
            </InsetText>
          )}
          {phraseRetards && (
            <WarningText>{phraseRetards}. Prêt possible, à toi de juger.</WarningText>
          )}
        </QuestionPage>
      )}

      {etape === 5 && (
        <Panel variante="success">
          <h1 style={{ marginTop: 0 }}>Prêt enregistré</h1>
          <p>
            {resultats.enregistres} livre{resultats.enregistres > 1 ? 's' : ''} pour{' '}
            {nomEleveChoisi ?? "l'élève"}, à rendre le{' '}
            {dateRetourPrevue ? formatDateLongue(dateRetourPrevue) : '—'}.
          </p>
        </Panel>
      )}
      {etape === 5 && (
        <>
          <p>Un rappel sera créé 2 jours avant la date de retour.</p>
          <p>
            <a
              className="lpv-link-inline"
              href="#"
              onClick={(e) => {
                e.preventDefault()
                reinitialiser()
              }}
            >
              Enregistrer un autre prêt
            </a>
          </p>
          <p>
            <Link className="lpv-link-inline" href="/profs/bibliotheque">
              Retour à la bibliothèque
            </Link>
          </p>
        </>
      )}

      {confirmOuvert && eleveChoisi && livresChoisis.length > 0 ? (
        <ConfirmAction
          confirmLabel="Enregistrer le prêt"
          description={`${livresChoisis.length} livre${livresChoisis.length > 1 ? 's' : ''} sera${
            livresChoisis.length > 1 ? 'nt' : ''
          } prêté${livresChoisis.length > 1 ? 's' : ''} à ${nomEleveChoisi} pour être rendu${
            livresChoisis.length > 1 ? 's' : ''
          } le ${formatDateLongue(dateRetourIso(duree))}. Confirmez avec votre mot de passe.`}
          onClose={() => {
            setConfirmOuvert(false)
            setErreur([])
          }}
          onConfirm={(motDePasse) => {
            if (motDePasse) void enregistrerPret(motDePasse)
          }}
          pending={pending}
          pendingLabel="Enregistrement…"
          requirePassword
          title="Enregistrer ce prêt ?"
        />
      ) : null}
    </div>
  )
}