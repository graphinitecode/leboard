'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import {
  Input,
  NotificationBanner,
  ErrorSummary,
} from '@/components/molecules'

import { useEnregistrerRetour } from '@/seances/application/seances.hooks'

export function ReturnForm({
  seanceId,
  initial,
}: {
  seanceId: number
  initial: string
}) {
  const [text, setText] = useState(initial)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enregistrerRetour = useEnregistrerRetour(seanceId)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSuccess(false)
        setError(null)
        enregistrerRetour.mutate(text, {
          onSuccess: () => setSuccess(true),
          onError: (err) => setError(err.message),
        })
      }}
    >
      {success && <NotificationBanner title="Retour enregistré" type="success" />}
      <ErrorSummary errors={error ? [error] : []} />
      <Input
        as="textarea"
        hint="Texte libre. Ce retour sera visible par les parents."
        id="retour"
        label="Retour de séance"
        onChange={(e) => setText(e.target.value)}
        rows={4}
        value={text}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button disabled={enregistrerRetour.isPending} type="submit">
          {enregistrerRetour.isPending ? 'Enregistrement…' : 'Enregistrer le retour'}
        </Button>
      </div>
    </form>
  )
}
