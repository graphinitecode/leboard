'use client'

import { useState } from 'react'

import { Button, InsetText, Panel, WarningText } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary } from '@/components/molecules'
import { QuestionPage } from '@/components/templates'
import {
  estPretEnCours,
  joursDeRetard,
  useListCatalogue,
  useListPretsParLivre,
  useRetirerCatalogue,
} from '@/bibliotheque'

export interface SupprimerLivreProps {
  livreId: number
}

export default function SupprimerLivreView({ livreId }: SupprimerLivreProps) {
  const catalogue = useListCatalogue()
  const prets = useListPretsParLivre(livreId)
  const retirer = useRetirerCatalogue()

  const livre = (catalogue.data ?? []).find((l) => l.id === livreId)
  const enCours = (prets.data ?? []).filter(estPretEnCours)

  const [erreurs, setErreurs] = useState<string[]>([])
  const [pending, setPending] = useState(false)
  const [supprime, setSupprime] = useState<string | null>(null)

  if (catalogue.isLoading) {
    return <p className="lpv-muted">Chargement du livre…</p>
  }

  if (supprime) {
    return (
      <div className="lpv-t-question-page">
        <Panel title="Livre supprimé">
          <p>« {supprime} » n&apos;est plus au catalogue.</p>
        </Panel>
        <p>
          <EnterText hrf="/profs/bibliotheque">Retour à la bibliothèque</EnterText>
        </p>
      </div>
    )
  }

  if (!livre) {
    return (
      <>
        <InsetText>Livre introuvable ou retiré du catalogue.</InsetText>
        <p>
          <EnterText hrf="/profs/bibliotheque">Retour à la bibliothèque</EnterText>
        </p>
      </>
    )
  }

  const titreLivre = livre.titre

  async function confirmer() {
    setErreurs([])
    setPending(true)
    try {
      await retirer.mutateAsync({ id: livreId })
      setSupprime(titreLivre)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErreurs([err instanceof Error ? err.message : 'Le livre n’a pas pu être supprimé.'])
      setPending(false)
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <QuestionPage
      actions={
        <>
          <Button disabled={pending} onClick={() => void confirmer()} type="button" variant="danger">
            Oui, supprimer ce livre
          </Button>
          <Button href={`/profs/bibliotheque/livres/${livreId}`} variant="secondary">
            Annuler
          </Button>
        </>
      }
      question={`Supprimer « ${livre.titre} » ?`}
      retour={{ href: `/profs/bibliotheque/livres/${livreId}`, label: 'Retour à la fiche du livre' }}
    >
      {erreurs.length > 0 && <ErrorSummary errors={erreurs} />}

      {/* GOV.UK : l'action destructive vit sur sa propre page, les conséquences
      y sont expliquées avant le geste, jamais à coups de window.confirm.
      En interne, « supprimer » = retirer du catalogue (archivage) : la
      suppression physique est interdite par la clé étrangère dès qu'un
      exemplaire a un historique de prêts — les conséquences affichées
      ci-dessous correspondent exactement à ce que fait l'archivage. */}
      <WarningText>
        Cette action est définitive. L&apos;historique des emprunts de ce livre
        sera conservé, mais il n&apos;apparaîtra plus dans le catalogue.
      </WarningText>
      {enCours.map((pret) => (
        <WarningText key={pret.id}>
          Un exemplaire est actuellement emprunté par {pret.eleveLabel ?? 'un élève'}, retour prévu
          le {formaterDate(pret.dateRetourPrevue)}
          {joursDeRetard(pret.dateRetourPrevue) > 0 ? ' (en retard)' : ''}. La suppression
          n&apos;annule pas ce prêt en cours.
        </WarningText>
      ))}
    </QuestionPage>
  )
}

const formaterDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'aucune'