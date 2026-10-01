'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button, InsetText, Panel } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary, Input } from '@/components/molecules'
import { QuestionPage } from '@/components/templates'
import {
  CATEGORIES_LIVRE,
  NIVEAUX_LIVRE,
  useCreerExemplaire,
  useListCatalogue,
  useListPretsParLivre,
  useModifierLivre,
  useSupprimerExemplaire,
} from '@/bibliotheque'

const ISBN_REGEX = /^\d{10}$|^\d{13}$/

const compactIsbn = (valeur: string): string => valeur.replace(/[\s-]/g, '')

export interface ModifierLivreProps {
  livreId: number
}

// Édition du livre (maquette examples/update-book.html) : comme l'ajout,
// un seul formulaire — modifier reste une tâche simple et fréquente — avec
// les différences propres à la modification :
//   • champs pré-remplis avec les valeurs actuelles du livre ; pas de widget
//     « pré-remplir avec l'ISBN » (il ne sert qu'à la création) ;
//   • garde-fou sur les exemplaires : la fiche rappelle avant la saisie
//     qu'un exemplaire est déjà prêté (contrainte métier visible avant la
//     saisie, pas découverte après coup) et bloque la descente sous ce
//     plancher — les exemplaires avec historique de prêts sont conservés ;
//   • la suppression est une action à part entière, sur sa propre page
//     (livres/[id]/supprimer), jamais window.confirm.
export default function ModifierLivreView({ livreId }: ModifierLivreProps) {
  const router = useRouter()
  const catalogue = useListCatalogue()
  const prets = useListPretsParLivre(livreId)
  const modifier = useModifierLivre()
  const creerExemplaire = useCreerExemplaire()
  const supprimerExemplaire = useSupprimerExemplaire()

  const livre = (catalogue.data ?? []).find((l) => l.id === livreId)

  const [titre, setTitre] = useState('')
  const [auteur, setAuteur] = useState('')
  const [isbn, setIsbn] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorie, setCategorie] = useState('')
  const [exemplaires, setExemplaires] = useState('1')
  const [resume, setResume] = useState('')
  const [erreurs, setErreurs] = useState<(string | { fieldId: string; text: string })[]>([])
  const [pending, setPending] = useState(false)
  const [succes, setSucces] = useState<string | null>(null)

  // Préremplissage après chargement du catalogue (une seule fois).
  const [prerempli, setPrerempli] = useState(false)
  if (livre && !prerempli) {
    setTitre(livre.titre)
    setAuteur(livre.auteur ?? '')
    setIsbn(livre.isbn ?? '')
    setNiveau(livre.niveau ?? '')
    setCategorie(livre.categorie ?? '')
    setExemplaires(String(livre.exemplaires.length))
    setResume(livre.resume ?? '')
    setPrerempli(true)
  }

  if (catalogue.isLoading) {
    return <p className="lpv-muted">Chargement du livre…</p>
  }

  if (!livre) {
    return (
      <>
        <InsetText>Livre introuvable ou retiré du catalogue.</InsetText>
        <p>
          <EnterText hrf="/profs/bibliotheque">Retour au catalogue</EnterText>
        </p>
      </>
    )
  }

  const totalActuel = livre.exemplaires.length
  // Garde-fou exemplaires : exemplaires actuellement prêtés (en circulation)
  // + exemplaires qui portent un historique de prêts (conservé — la clé
  // étrangère interdit leur suppression). Deux planchers, un seul message.
  const codesAvecPret = new Set(
    (prets.data ?? [])
      .map((pret) => pret.exemplaireCode)
      .filter((code): code is string => Boolean(code)),
  )
  const nbEnCours = livre.exemplaires.filter((ex) => !ex.disponible).length
  const supprimables = livre.exemplaires.filter(estSupprimable(codesAvecPret))
  const plancherExemplaires = Math.max(nbEnCours, totalActuel - supprimables.length)

  async function enregistrer() {
    const problemes: { fieldId: string; text: string }[] = []
    if (!titre.trim()) problemes.push({ fieldId: 'livre-titre', text: 'Saisis le titre du livre' })
    if (!auteur.trim()) problemes.push({ fieldId: 'livre-auteur', text: "Saisis l'auteur du livre" })
    const nombre = Number(exemplaires)
    if (!Number.isInteger(nombre) || nombre < 1 || nombre < nbEnCours) {
      problemes.push({
        fieldId: 'livre-exemplaires',
        text: "Saisis le nombre d'exemplaires (1 minimum, au moins autant que d'exemplaires actuellement prêtés)",
      })
    } else if (nombre < plancherExemplaires) {
      problemes.push({
        fieldId: 'livre-exemplaires',
        text: `Saisis au moins ${plancherExemplaires} exemplaire${
          plancherExemplaires > 1 ? 's' : ''
        } — l'historique des prêts est conservé`,
      })
    }
    const isbnCompact = compactIsbn(isbn)
    if (isbnCompact && !ISBN_REGEX.test(isbnCompact)) {
      problemes.push({ fieldId: 'livre-isbn', text: "Corrige l'ISBN (10 ou 13 chiffres attendus)" })
    }
    setErreurs(problemes)
    if (problemes.length > 0) {
      window.scrollTo({ top: 0 })
      return
    }

    setPending(true)
    try {
      // null = vider le champ (le PATCH Payload ne touche que les clés présentes).
      await modifier.mutateAsync({
        auteur: auteur.trim() || null,
        categorie: categorie || null,
        id: livreId,
        isbn: isbnCompact || null,
        niveau: niveau || null,
        resume: resume.trim() || null,
        titre: titre.trim(),
      })

      // Exemplaires : au-dessus on crée les exemplaires manquants (code LPV
      // auto-généré), en dessous on retire les plus récents qui ne sont ni
      // prêtés ni porteurs d'historique.
      const delta = nombre - totalActuel
      if (delta > 0) {
        for (let i = 0; i < delta; i += 1) {
          await creerExemplaire.mutateAsync({ livre: livreId })
        }
      } else if (delta < 0) {
        const candidates = supprimables.slice().sort((x, y) => y.id - x.id)
        for (const ex of candidates.slice(0, -delta)) {
          await supprimerExemplaire.mutateAsync({ id: ex.id })
        }
      }

      setSucces(`« ${titre.trim()} » a été mis à jour.`)
      setErreurs([])
      router.refresh()
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErreurs([err instanceof Error ? err.message : 'Le livre n’a pas pu être modifié.'])
      window.scrollTo({ top: 0 })
    } finally {
      setPending(false)
    }
  }

  if (succes) {
    return (
      <div className="lpv-t-question-page">
        <Panel title="Modifications enregistrées" variante="success">
          <p>{succes}</p>
        </Panel>
        <p>
          <EnterText hrf={`/profs/bibliotheque/livres/${livreId}`}>
            Retour à la fiche du livre
          </EnterText>
        </p>
        <p>
          <EnterText hrf="/profs/bibliotheque">Retour au catalogue</EnterText>
        </p>
      </div>
    )
  }

  return (
    <QuestionPage
      actions={
        <>
          <Button
            disabled={pending}
            onClick={() => void enregistrer()}
            type="button"
            variant="success"
          >
            Enregistrer les modifications
          </Button>
          <Button href={`/profs/bibliotheque/livres/${livreId}/supprimer`} variant="danger">
            Supprimer ce livre
          </Button>
        </>
      }
      question="Modifier le livre"
      retour={{ href: `/profs/bibliotheque/livres/${livreId}`, label: 'Retour à la fiche du livre' }}
    >
      {erreurs.length > 0 && <ErrorSummary errors={erreurs} />}

      <Input
        id="livre-titre"
        label="Titre"
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
        hint="Les chiffres au dos du livre (10 ou 13)."
        id="livre-isbn"
        label="ISBN"
        onChange={(e) => setIsbn(e.target.value)}
        optional
        value={isbn}
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
        hint={
          nbEnCours > 0
            ? `${nbEnCours} exemplaire${nbEnCours > 1 ? 's' : ''} ${
                nbEnCours > 1 ? 'sont' : 'est'
              } actuellement prêté${nbEnCours > 1 ? 's' : ''} — tu ne peux pas descendre en dessous.`
            : undefined
        }
        id="livre-exemplaires"
        label="Nombre d'exemplaires"
        min={String(Math.max(1, plancherExemplaires))}
        onChange={(e) => setExemplaires(e.target.value)}
        type="number"
        value={exemplaires}
        className="max-w-[125px]"
      />
      <Input
        as="textarea"
        hint="Quelques phrases qui présentent l'ouvrage aux élèves et aux familles."
        id="livre-resume"
        label="Résumé"
        onChange={(e) => setResume(e.target.value)}
        optional
        value={resume}
      />
    </QuestionPage>
  )
}

// Exemplaire retirable : non prêté à l'instant même et sans aucun prêt dans
// son historique (les prêts passés restent attachés à l'exemplaire).
function estSupprimable(codesAvecPret: Set<string>) {
  return (exemplaire: { disponible: boolean; id: number; code: string }): boolean =>
    exemplaire.disponible && !codesAvecPret.has(exemplaire.code)
}