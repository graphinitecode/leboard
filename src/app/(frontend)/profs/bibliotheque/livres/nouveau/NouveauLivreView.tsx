'use client'

import { useMemo, useState } from 'react'

import { Button, Icon, InsetText, Panel, Tag, WarningText } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage } from '@/components/templates'
import {
  compacterIsbn,
  CATEGORIES_LIVRE,
  detecterDoublonCatalogue,
  NIVEAUX_LIVRE,
  useCreerExemplaire,
  useCreerLivre,
  useListCatalogue,
} from '@/bibliotheque'
import Link from 'next/link'

const ISBN_REGEX = /^\d{10}$|^\d{13}$/

// Page « Ajouter un livre » (maquette examples/add-livre-form.html) :
// formulaire simple d'une page, succès en panneau (plus de wizard 3 étapes).
// L'import CSV de plusieurs livres vit désormais sur sa page dédiée
// (/profs/bibliotheque/livres/import — scénario examples/import-books.html).
// Conformités maquette : titre + auteur requis, nombre d'exemplaires ≥ 1
// (chaque exemplaire = un POST, code LPV-xxxx auto-généré côté Payload),
// résumé facultatif.

export default function NouveauLivreView() {
  const catalogue = useListCatalogue()
  const creer = useCreerLivre()
  const creerExemplaire = useCreerExemplaire()

  const [isbn, setIsbn] = useState('')
  const [isbnEtat, setIsbnEtat] = useState<{
    variante: 'doublon' | 'invalide' | 'introuvable'
    texte: string
    ficheHref?: string
  } | null>(null)
  const [titre, setTitre] = useState('')
  const [auteur, setAuteur] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorie, setCategorie] = useState('')
  const [exemplaires, setExemplaires] = useState('1')
  const [resume, setResume] = useState('')
  const [image, setImage] = useState('')
  const [erreurs, setErreurs] = useState<(string | { fieldId: string; text: string })[]>([])
  const [pending, setPending] = useState(false)
  const [succes, setSucces] = useState<string | null>(null)

  // Doublon détecté en direct pendant la saisie (règle partagée avec la garde
  // serveur) : bloquant = même ISBN, ou même titre + auteur sans ISBN saisi ;
  // avertissement = même titre + auteur avec un autre ISBN (édition distincte
  // probable) — l'utilisateur tranche, la création reste possible.
  const doublon = useMemo(
    () =>
      detecterDoublonCatalogue(
        { auteur, isbn: isbn, titre: titre },
        catalogue.data ?? [],
      ),
    [auteur, catalogue.data, isbn, titre],
  )

  // ISBN d'un ouvrage déjà référencé : doublon prévenu (orange) plutôt que
  // pré-rempli — créer un doublon serait une erreur de fond. Pas d'autre
  // base ISBN : ouvrage inconnu → saisie manuelle (info bleue).
  function rechercherIsbn() {
    const compact = compacterIsbn(isbn)
    if (!ISBN_REGEX.test(compact)) {
      setIsbnEtat({
        texte: "L'ISBN doit contenir 10 ou 13 chiffres",
        variante: 'invalide',
      })
      return
    }
    const existant = (catalogue.data ?? []).find(
      (livre) => compacterIsbn(livre.isbn ?? '') === compact,
    )
    if (existant) {
      setIsbnEtat({
        ficheHref: `/profs/bibliotheque/livres/${existant.id}`,
        texte: `« ${existant.titre} » est déjà au catalogue`,
        variante: 'doublon',
      })
      return
    }
    setIsbnEtat({
      texte: 'Aucun livre trouvé pour cet ISBN. Saisis les informations à la main.',
      variante: 'introuvable',
    })
  }

  async function enregistrerLivre() {
    const problemes: { fieldId: string; text: string }[] = []
    if (!titre.trim()) problemes.push({ fieldId: 'livre-titre', text: 'Saisis le titre du livre' })
    if (!auteur.trim()) problemes.push({ fieldId: 'livre-auteur', text: "Saisis l'auteur du livre" })
    const nombre = Number(exemplaires)
    if (!Number.isInteger(nombre) || nombre < 1) {
      problemes.push({
        fieldId: 'livre-exemplaires',
        text: "Saisis le nombre d'exemplaires (1 minimum)",
      })
    }
    const isbnCompact = compacterIsbn(isbn)
    if (isbnCompact && !ISBN_REGEX.test(isbnCompact)) {
      problemes.push({ fieldId: 'livre-isbn', text: 'Corrige l\'ISBN (10 ou 13 chiffres attendus)' })
    }
    // Garde doublon avant l'appel : le serveur refuse de toute façonne, mieux
    // vaut afficher le contexte (et le lien vers la fiche) en résumé d'erreurs.
    const doublonCreation = detecterDoublonCatalogue(
      { auteur: auteur.trim(), isbn: isbnCompact, titre: titre.trim() },
      catalogue.data ?? [],
    )
    if (doublonCreation?.gravite === 'bloquant') {
      problemes.push({
        fieldId: 'livre-titre',
        text: `${doublonCreation.message} Passez par la fiche du livre (Modifier) pour ajouter des exemplaires.`,
      })
    }
    setErreurs(problemes)
    if (problemes.length > 0) {
      window.scrollTo({ top: 0 })
      return
    }

    setPending(true)
    try {
      const id = await creer.mutateAsync({
        auteur: auteur.trim() || undefined,
        categorie: categorie || undefined,
        imageUrl: image.trim() || undefined,
        isbn: isbnCompact || undefined,
        niveau: niveau || undefined,
        resume: resume.trim() || undefined,
        titre: titre.trim(),
      })
      for (let i = 0; i < nombre; i += 1) {
        await creerExemplaire.mutateAsync({ livre: id })
      }
      setSucces(
        `« ${titre.trim()} »${auteur.trim() ? ` de ${auteur.trim()}` : ''} — ${nombre} exemplaire${nombre > 1 ? 's' : ''}`,
      )
      // Rafraîchit la liste du catalogue pour l'existence d'une autre vue ouverte.
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErreurs([err instanceof Error ? err.message : 'Le livre n’a pas pu être créé.'])
    } finally {
      setPending(false)
    }
  }

  function reinitialiser() {
    setIsbn('')
    setIsbnEtat(null)
    setTitre('')
    setAuteur('')
    setNiveau('')
    setCategorie('')
    setExemplaires('1')
    setResume('')
    setImage('')
    setErreurs([])
    setSucces(null)
  }

  return (
    <div className="lpv-container">
      {succes ? (
        <div className="lpv-t-question-page">
          <Panel title="Livre ajouté au catalogue" variante="success">
            <p>{succes}</p>
          </Panel>
          <div className="pb-3">
            <EnterText
              hrf="#"
              onClick={(event) => {
                event.preventDefault()
                reinitialiser()
              }}
            >
              Ajouter un autre livre
            </EnterText>
          </div>
          <div>
            <EnterText hrf="/profs/bibliotheque">Retour au catalogue</EnterText>
          </div>
        </div>
      ) : (
        <QuestionPage
          actions={
            <Button
              disabled={pending}
              onClick={() => enregistrerLivre()}
              type="button"
              variant="success"
            >
              Ajouter au catalogue
            </Button>
          }
          question="Ajouter un livre"
          retour={{ href: '/profs/bibliotheque', label: 'Retour au catalogue' }}
        >
          {erreurs.length > 0 && <ErrorSummary errors={erreurs} />}

          <div className="pb-4">
            <p className="lpv-muted py-4 flex">
              Plusieurs livres à ajouter ?{' '}
              <Link href="/profs/bibliotheque/livres/import" className="lpv-link-inline flex items-center ml-2">
                Importer un fichier CSV <Icon icon={'rivet-icons:arrow-up-right'} size={21} />
              </Link>
            </p>
          </div>

          <aside className="lpv-t-dashboard-page__aside mb-7">
            <div className="lpv-t-dashboard-page__aside-card">
              <div className="flex items-baseline-last gap-x-2 -mb-5">
                <Input
                  hint="Les 10 à 13 chiffres que l'on retrouve au dos du livre."
                  id="livre-isbn"
                  label="Pré-remplir avec l'ISBN"
                  onChange={(e) => {
                    setIsbn(e.target.value)
                    setIsbnEtat(null)
                  }}
                  optional
                  value={isbn}
                />
                <Button disabled={pending} onClick={rechercherIsbn} type="button" variant="primary">
                  Rechercher
                </Button>
              </div>
              {isbnEtat && (
                <InsetText>
                  {isbnEtat.texte}
                  {isbnEtat.ficheHref && (
                    <span>
                      {' — '}
                      <a className="lpv-link-inline" href={isbnEtat.ficheHref}>
                        Voir la fiche
                      </a>
                    </span>
                  )}{' '}
                  <Tag
                    color={
                      isbnEtat.variante === 'invalide'
                        ? 'red'
                        : isbnEtat.variante === 'doublon'
                          ? 'orange'
                          : 'blue'
                    }
                  >
                    {isbnEtat.variante === 'invalide'
                      ? 'ISBN invalide'
                      : isbnEtat.variante === 'doublon'
                        ? 'Déjà au catalogue'
                        : 'Non trouvé'}
                  </Tag>
                </InsetText>
              )}
            </div>
          </aside>
          {/*<Details summary=""></Details>*/}

          {doublon ? (
            doublon.gravite === 'bloquant' ? (
              <WarningText>
                {doublon.message} Pour ajouter des exemplaires, passez par sa fiche :{' '}
                <a
                  className="lpv-link-inline"
                  href={`/profs/bibliotheque/livres/${doublon.idLivre}/modifier`}
                >
                  Modifier le livre
                </a>
              </WarningText>
            ) : (
              <InsetText>
                {doublon.message}{' '}
                <a
                  className="lpv-link-inline"
                  href={`/profs/bibliotheque/livres/${doublon.idLivre}`}
                >
                  Voir la fiche
                </a>
              </InsetText>
            )
          ) : null}

          <Input
            id="livre-titre"
            label="Titre du livre"
            onChange={(e) => setTitre(e.target.value)}
            value={titre}
          />
          <Input
            id="livre-auteur"
            label="Auteur"
            onChange={(e) => setAuteur(e.target.value)}
            value={auteur}
          />
          <Input
            as="select"
            id="livre-niveau"
            label="Niveau conseillé"
            onChange={(e) => setNiveau(e.target.value)}
            optional
            options={[{ label: 'Choisir un niveau…', value: '' }, ...NIVEAUX_LIVRE]}
            value={niveau}
          />
          <Input
            as="select"
            id="livre-categorie"
            label="Catégorie"
            onChange={(e) => setCategorie(e.target.value)}
            optional
            options={[{ label: 'Choisir une catégorie…', value: '' }, ...CATEGORIES_LIVRE]}
            value={categorie}
          />
          <Input
            hint="Chaque exemplaire recevra son code LPV automatiquement."
            id="livre-exemplaires"
            label="Nombre d'exemplaires"
            min="1"
            onChange={(e) => setExemplaires(e.target.value)}
            type="number"
            value={exemplaires}
            className="max-w-31.25"
          />
          <Input
            as="textarea"
            hint="Quelques phrases qui présentent l'ouvrage aux élèves et aux familles."
            id="livre-resume"
            label="Résumé de l'ouvrage"
            onChange={(e) => setResume(e.target.value)}
            optional
            value={resume}
          />
          <Input
            hint="Adresse web de la couverture (https://…), affichée sur la fiche du livre."
            id="livre-image"
            label="Image de couverture (adresse web)"
            name="image"
            onChange={(e) => setImage(e.target.value)}
            optional
            placeholder="https://example.com/couverture.jpg"
            type="url"
          />
        </QuestionPage>
      )}
    </div>
  )
}
