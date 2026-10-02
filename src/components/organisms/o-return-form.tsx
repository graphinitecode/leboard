'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import {
  Input,
  ErrorSummary,
} from '@/components/molecules'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'

import { useEnregistrerRetour } from '@/seances/application/seances.hooks'

export function ReturnForm({
  seanceId,
  initial,
  onAnnule,
  onEnregistre,
}: {
  seanceId: number
  initial: string
  /** Appelé à l'annulation (sortie du mode édition sans enregistrer). */
  onAnnule?: () => void
  /** Appelé après un enregistrement réussi (sortie du mode édition). */
  onEnregistre?: () => void
}) {
  const [text, setText] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [confirmOuvert, setConfirmOuvert] = useState(false)

  const enregistrerRetour = useEnregistrerRetour(seanceId)

  function enregistrer() {
    setError(null)
    enregistrerRetour.mutate(text, {
      onSuccess: () => {
        setConfirmOuvert(false)
        onEnregistre?.()
      },
      onError: (err) => {
        setError(err.message)
        setConfirmOuvert(false)
      },
    })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setConfirmOuvert(true)
      }}
    >
      <ErrorSummary errors={error ? [error] : []} />
      <Input
        as="textarea"
        hint="Texte libre. Ce retour sera visible par les parents."
        id="retour"
        label="" //"Retour de séance"
        onChange={(e) => setText(e.target.value)}
        rows={4}
        value={text}
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
        <Button disabled={enregistrerRetour.isPending} type="submit">
          {enregistrerRetour.isPending ? 'Enregistrement…' : 'Enregistrer le retour'}
        </Button>
        {onAnnule && !enregistrerRetour.isPending && (
          <Button onClick={onAnnule} type="button" variant="secondary">
            Annuler
          </Button>
        )}
      </div>

      {confirmOuvert ? (
        <ConfirmAction
          confirmLabel="Enregistrer"
          description="Ce retour de séance sera visible par les parents de l'élève."
          onClose={() => setConfirmOuvert(false)}
          onConfirm={() => enregistrer()}
          pending={enregistrerRetour.isPending}
          pendingLabel="Enregistrement…"
          title="Enregistrer ce retour de séance ?"
        />
      ) : null}
    </form>
  )
}
