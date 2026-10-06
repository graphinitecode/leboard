'use client'

import { useState } from 'react'

import { Button, InsetText, Panel, WarningText } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary } from '@/components/molecules'
import { Radios } from '@/components/molecules/m-radios'
import { OPTIONS_PORTEE } from '@/components/organisms/o-portee-serie'
import { QuestionPage } from '@/components/templates'
import { useSupprimerSeance } from '@/calendrier'
import type { PorteeSerie } from '@/seances/domain/recurrence'
import { presentSeanceDetail, useGetSeance } from '@/seances'

const CONSEQUENCES: Record<PorteeSerie, string> = {
  suivantes:
    'Cette séance et toutes les suivantes de la série seront supprimées, avec leurs présences. La série s’arrêtera la veille de cette séance.',
  toutes:
    'Toutes les séances à venir de la série seront supprimées, avec leurs présences. Les séances passées sont conservées avec leur historique de présences.',
  une: 'Seule cette séance sera supprimée, avec ses présences. Les autres séances de la série ne changent pas.',
}

const RESULTATS: Record<PorteeSerie, string> = {
  suivantes: 'Cette séance et les suivantes ont été supprimées ; la série est arrêtée.',
  toutes: 'Les séances à venir de la série ont été supprimées ; la série est arrêtée.',
  une: 'La séance a été supprimée.',
}

export default function SupprimerSeanceView({ seanceId }: { seanceId: number }) {
  const { data: detail, isLoading } = useGetSeance(seanceId)
  const supprimer = useSupprimerSeance()
  const [portee, setPortee] = useState<PorteeSerie>('une')
  const [erreurs, setErreurs] = useState<string[]>([])
  const [supprimee, setSupprimee] = useState(false)

  if (isLoading) {
    return <p className="lpv-muted">Chargement de la séance…</p>
  }

  if (supprimee) {
    return (
      <div className="lpv-t-question-page">
        <Panel title="Suppression effectuée" variante="success">
          <p>{RESULTATS[portee]}</p>
        </Panel>
        <div>
          <EnterText hrf="/profs/calendrier">Retour au calendrier</EnterText>
        </div>
      </div>
    )
  }

  const viewModel = detail ? presentSeanceDetail(detail) : null
  if (!viewModel?.seance.repetitionLabel) {
    return (
      <>
        <InsetText>Séance introuvable, ou séance ponctuelle : sa suppression est réservée à l’administration.</InsetText>
        <div>
          <EnterText hrf="/profs/calendrier">Retour au calendrier</EnterText>
        </div>
      </>
    )
  }

  const { seance } = viewModel

  async function confirmer() {
    setErreurs([])
    try {
      await supprimer.mutateAsync({ portee, seanceId })
      setSupprimee(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErreurs([err instanceof Error ? err.message : 'La séance n’a pas pu être supprimée.'])
      window.scrollTo({ top: 0 })
    }
  }

  return (
    <QuestionPage
      actions={
        <>
          <Button disabled={supprimer.isPending} onClick={() => void confirmer()} type="button" variant="danger">
            {supprimer.isPending ? 'Suppression…' : 'Oui, supprimer'}
          </Button>
          <Button href={`/profs/seances/${seanceId}`} variant="secondary">
            Annuler
          </Button>
        </>
      }
      question={`Supprimer la séance de ${seance.matiereLabel} du ${seance.dateLabel} ?`}
      retour={{ href: `/profs/seances/${seanceId}`, label: 'Retour à la séance' }}
    >
      {erreurs.length > 0 && <ErrorSummary errors={erreurs} />}
      <p className="lpv-muted">
        {seance.creneauLabel} · {seance.repetitionLabel}
      </p>
      <Radios
        idPrefix="supprimer-portee"
        legendSize="s"
        name="Cette séance fait partie d’une série. Supprimer :"
        onChange={(e) => setPortee(e.target.value as PorteeSerie)}
        options={OPTIONS_PORTEE}
        value={portee}
      />
      <WarningText>{CONSEQUENCES[portee]} Cette action est définitive.</WarningText>
    </QuestionPage>
  )
}
