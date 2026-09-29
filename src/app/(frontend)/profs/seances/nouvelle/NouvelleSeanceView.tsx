'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/atoms/a-button'
import { Panel, WarningText } from '@/components/atoms'
import { Combobox, type ComboboxOption, ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage, QuestionPageAnswers } from '@/components/templates'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import {
  HEURE_DEBUT_GRILLE,
  HEURE_FIN_GRILLE,
  JOURS_GRILLE,
  chevaucheUne,
  dateCiblee,
  debutSemaine,
  bornesSemaine,
  joursGrille,
} from '@/calendrier/domain/calendrier.utils'
import type { MatiereCalendrier } from '@/calendrier/domain/calendrier.entity'
import { useCreerSeance, useElevesDuProf, useSeancesPeriode } from '@/calendrier'
import { nomEleve } from '@/students'

const MATIERES: { label: string; value: MatiereCalendrier }[] = [
  { label: 'Maths', value: 'maths' },
  { label: 'Français', value: 'francais' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Autre', value: 'autre' },
]

type Etape = 'jour' | 'debut' | 'fin' | 'matiere' | 'eleves' | 'recap' | 'confirme'

// Parcours « une question par écran » (pattern GOV.UK question pages),
// construit sur le template QuestionPage : chaque page = back link + caption
// + h1 (la question) + contrôle + « Vos réponses » + Continuer.
// Dernière page : « Vérifiez vos réponses » (récapitulatif) puis confirmation.
export default function NouvelleSeanceView() {
  return (
    <Suspense fallback={<p className="lpv-muted">Chargement…</p>}>
      <ParcoursNouvelleSeance />
    </Suspense>
  )
}

function ParcoursNouvelleSeance() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState<Etape>('jour')
  const [erreur, setErreur] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [confirmOuvert, setConfirmOuvert] = useState(false)
  const [eleveIds, setEleveIds] = useState<number[]>([])

  // Préremplissage depuis l'URL (clic-tirer sur le calendrier, bouton d'un jour).
  const initial = useMemo(() => initialiserDepuisParams(params), [params])
  const [jourIndex, setJourIndex] = useState(initial.jourIndex)
  const [heureDebut, setHeureDebut] = useState(initial.heureDebut)
  const [heureFin, setHeureFin] = useState(initial.heureFin)
  const [matiere, setMatiere] = useState<MatiereCalendrier | ''>('')

  const lundi = useMemo(() => debutSemaine(new Date()), [])
  const { debut, fin } = useMemo(() => bornesSemaine(lundi), [lundi])
  const seances = useSeancesPeriode({ debut, fin })
  const eleves = useElevesDuProf()
  const creer = useCreerSeance()
  const optionsEleves = useMemo<ComboboxOption<number>[]>(
    () =>
      (eleves.data ?? []).map((eleve) => ({
        id: `eleve-${eleve.id}`,
        label: nomEleve(eleve),
        sublabel: [eleve.niveau].filter(Boolean).join(' · '),
        disabled: eleveIds.includes(eleve.id),
        value: eleve.id,
      })),
    [eleves.data, eleveIds],
  )

  const events = seances.data ?? []
  const duree = heureDebut && heureFin ? plageMinutes(heureDebut, heureFin) : null
  const conflit =
    heureDebut && heureFin
      ? chevaucheUne(
          { debut: dateCiblee(lundi, { jourIndex, heureDebut }), dureeMin: duree ?? 60 },
          events,
        )
      : null

  const elevesSelectionnes = (eleves.data ?? []).filter((e) => eleveIds.includes(e.id))
  const nomsEleves = elevesSelectionnes.map(nomEleve)

  const retirerEleve = (id: number) => {
    setErreur([])
    setEleveIds((prev) => prev.filter((eleveId) => eleveId !== id))
  }

  async function valider() {
    if (eleveIds.length === 0 || !heureDebut || !heureFin || matiere === '') return
    setErreur([])
    setPending(true)
    try {
      await creer.mutateAsync({
        debut: dateCiblee(lundi, { jourIndex, heureDebut }),
        dureeMin: plageMinutes(heureDebut, heureFin),
        matiere,
        eleveIds,
      })
      setPending(false)
      setConfirmOuvert(false)
      setStep('confirme')
    } catch (err) {
      setErreur([err instanceof Error ? err.message : 'La séance n’a pas pu être créée.'])
      setPending(false)
      setConfirmOuvert(false)
    }
  }

  function recommencer() {
    setStep('jour')
    setJourIndex(0)
    setHeureDebut('')
    setHeureFin('')
    setMatiere('')
    setEleveIds([])
    setErreur([])
  }

  return (
    <div className="lpv-container">
      {step === 'jour' && (
        <QuestionPage
          actions={
            <Button onClick={() => setStep('debut')} type="button" variant="success">
              Continuer
            </Button>
          }
          question="Quel jour se tiendra la séance ?"
          retour={{ href: '/profs', label: 'Retour au Tableau de bord' }}
          htmlFor="seance-jour"
          step={1}
          stepSize={5}
        >
          <div className="lpv-o-availability-wizard__days" id="seance-jour">
            {JOURS_GRILLE.map((label, index) => (
              <button
                className={`lpv-o-availability-wizard__day-option${jourIndex === index ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={label}
                onClick={() => setJourIndex(index)}
                type="button"
              >
                {label} {joursGrille(lundi)[index].getDate()}
              </button>
            ))}
          </div>
        </QuestionPage>
      )}

      {step === 'debut' && (
        <QuestionPage
          actions={
            <Button
              disabled={!heureDebut}
              onClick={() => setStep('fin')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="À quelle heure commencera cette séance ?"
          retour={{ href: '#', onClick: () => setStep('jour') }}
          htmlFor="seance-debut"
          step={2}
          stepSize={5}
        >
          <Input
            hint={`Choisir une heure entre ${HEURE_DEBUT_GRILLE}h et ${HEURE_FIN_GRILLE}h.`}
            id="seance-debut"
            label=""
            max="20:00"
            min="08:00"
            onChange={(e) => setHeureDebut(e.target.value)}
            type="time"
            value={heureDebut}
          />
        </QuestionPage>
      )}

      {step === 'fin' && (
        <QuestionPage
          actions={
            <Button
              disabled={!heureFin || (duree !== null && duree < 30)}
              onClick={() => setStep('matiere')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Cette séance se terminera à quelle heure ?"
          retour={{ href: '#', onClick: () => setStep('debut') }}
          step={3}
          htmlFor="seance-fin"
          stepSize={5}
        >
          <Input
            hint={duree ? `Durée : ${formaterDuree(duree)}` : 'Par exemple 14:30'}
            id="seance-fin"
            label=""
            max="20:00"
            min={heureDebut || '08:00'}
            onChange={(e) => setHeureFin(e.target.value)}
            type="time"
            value={heureFin}
          />
        </QuestionPage>
      )}

      {step === 'matiere' && (
        <QuestionPage
          actions={
            <Button
              disabled={matiere === ''}
              onClick={() => setStep('eleves')}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Sur quelle matière portera t-elle ?"
          retour={{ href: '#', onClick: () => setStep('fin') }}
          step={4}
          stepSize={5}
        >
          <div className="lpv-o-availability-wizard__days">
            {MATIERES.map((option) => (
              <button
                className={`lpv-o-availability-wizard__day-option${matiere === option.value ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={option.value}
                onClick={() => setMatiere(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </QuestionPage>
      )}

      {step === 'eleves' && (
        <QuestionPage
          actions={
            <Button
              onClick={() => {
                if (eleveIds.length === 0) {
                  setErreur(['Choisis au moins un élève'])
                  return
                }
                setErreur([])
                setStep('recap')
              }}
              type="button"
              variant="success"
            >
              Continuer
            </Button>
          }
          question="Quels sont les élèves conviés ?"
          retour={{ href: '#', onClick: () => setStep('matiere') }}
          step={5}
          stepSize={5}
        >
          {erreur.length > 0 && <ErrorSummary errors={erreur} />}
          {eleves.isLoading ? (
            <p className="lpv-muted">Chargement des élèves…</p>
          ) : (eleves.data ?? []).length === 0 ? (
            <p className="lpv-muted">Aucun élève relié à votre compte.</p>
          ) : (
            <>
              <Combobox
                ariaLabel="Élèves"
                hint="Tape un prénom ou un nom. Tu peux en choisir plusieurs."
                id="seance-eleve"
                label=""
                onChange={(option) => {
                  setErreur([])
                  const id = option.value
                  setEleveIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
                }}
                options={optionsEleves}
                placeholder="Prénom ou nom…"
              />
              {elevesSelectionnes.length > 0 && (
                <div className="lpv-m-combobox__selection-list">
                  {elevesSelectionnes.map((eleve) => (
                    <div className="lpv-m-combobox__selection" key={eleve.id}>
                      <div className="lpv-m-combobox__selection__content">
                        <div className="lpv-m-combobox__selection__content-label">
                          {nomEleve(eleve)}
                        </div>
                        {eleve.niveau ? (
                          <div className="lpv-m-combobox__selection__content-sub">
                            {eleve.niveau}
                          </div>
                        ) : null}
                      </div>
                      <div
                        className="lpv-link-inline cursor-pointer"
                        onClick={() => retirerEleve(eleve.id)}
                      >
                        Retirer
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </QuestionPage>
      )}

      {step === 'recap' && (
        <QuestionPage
          actions={
            <>
              {erreur.length > 0 && <ErrorSummary errors={erreur} />}
              <Button disabled={pending} onClick={() => setConfirmOuvert(true)} type="button" variant="success">
                Créer la séance
              </Button>
            </>
          }
          question="Vérifiez vos réponses"
          retour={{ href: '/profs', label: 'Tableau de bord' }}
        >
          <QuestionPageAnswers
            reponses={[
              {
                question: 'Jour',
                valeur: `${JOURS_GRILLE[jourIndex]} ${joursGrille(lundi)[jourIndex].getDate()}`,
                onClick: () => setStep('jour'),
              },
              {
                question: 'Heures',
                valeur: `${heureDebut} → ${heureFin}`,
                onClick: () => setStep('debut'),
              },
              {
                question: 'Matière',
                valeur: labelMatiere(matiere),
                onClick: () => setStep('matiere'),
              },
              {
                question: 'Élèves',
                valeur:
                  elevesSelectionnes.length > 0 ? (
                    <>
                      {elevesSelectionnes.map((eleve) => (
                        <span key={eleve.id} style={{ display: 'block' }}>
                          {nomEleve(eleve)}
                        </span>
                      ))}
                    </>
                  ) : (
                    '—'
                  ),
                onClick: () => setStep('eleves'),
              },
            ]}
          />
          {conflit && (
            <WarningText>
              Cette plage chevauche une séance existante ({labelMatiere(conflit.matiere)} à{' '}
              {conflit.debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              ).
            </WarningText>
          )}
        </QuestionPage>
      )}

      {step === 'confirme' && (
        <QuestionPage question="Séance créée">
          <Panel>
            {JOURS_GRILLE[jourIndex]} {joursGrille(lundi)[jourIndex].getDate()} · {heureDebut} →{' '}
            {heureFin} · {labelMatiere(matiere)} · {nomsEleves.join(', ') || '—'}
          </Panel>
          <div className="lpv-t-question-page__actions">
            <Button onClick={() => router.push('/profs')} type="button">
              Retour au tableau de bord
            </Button>
            <Button onClick={recommencer} type="button" variant="secondary">
              Créer une autre séance
            </Button>
          </div>
        </QuestionPage>
      )}

      {confirmOuvert && step === 'recap' ? (
        <ConfirmAction
          confirmLabel="Créer la séance"
          description={`${JOURS_GRILLE[jourIndex]} ${heureDebut} → ${heureFin}${matiere ? ` · ${labelMatiere(matiere)}` : ''}${nomsEleves.length > 0 ? ` pour ${nomsEleves.join(', ')}` : ''}. Cette séance apparaîtra dans votre planning.`}
          onClose={() => {
            setConfirmOuvert(false)
            setErreur([])
          }}
          onConfirm={() => {
            void valider()
          }}
          pending={pending}
          pendingLabel="Enregistrement…"
          title="Créer cette séance ?"
        />
      ) : null}
    </div>
  )
}

// Lecture des paramètres de préremplissage (?date=YYYY-MM-DD&debut=HH:mm&fin=HH:mm).
function initialiserDepuisParams(params: URLSearchParams): {
  jourIndex: number
  heureDebut: string
  heureFin: string
} {
  const lundi = debutSemaine(new Date())
  const dateParam = params.get('date')
  let jourIndex = 0
  if (dateParam !== null && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    const date = new Date(`${dateParam}T12:00:00`)
    const index = (date.getDay() + 6) % 7
    const lundiCible = debutSemaine(date)
    if (lundiCible.toDateString() === lundi.toDateString() && index <= 5) {
      jourIndex = index
    }
  }
  return {
    jourIndex,
    heureDebut: /^\d{2}:\d{2}$/.test(params.get('debut') ?? '') ? (params.get('debut') as string) : '',
    heureFin: /^\d{2}:\d{2}$/.test(params.get('fin') ?? '') ? (params.get('fin') as string) : '',
  }
}

function labelMatiere(matiere: MatiereCalendrier | ''): string {
  if (matiere === '') return '—'
  return MATIERES.find((m) => m.value === matiere)?.label ?? '—'
}

function plageMinutes(debut: string, fin: string): number {
  const [dh, dm] = debut.split(':').map(Number)
  const [fh, fm] = fin.split(':').map(Number)
  const minutes = (fh ?? 0) * 60 + (fm ?? 0) - ((dh ?? 0) * 60 + (dm ?? 0))
  return Math.max(Math.round(minutes / 15) * 15, 0)
}

// Durées arrondies au quart d'heure (plageMinutes) : libellé parlant.
function formaterDuree(minutes: number): string {
  if (minutes === 15) return "un quart d'heure"
  if (minutes === 30) return 'une demi-heure'
  if (minutes === 45) return "trois quarts d'heure"
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${heures}h` : `${heures}h${reste}`
}
