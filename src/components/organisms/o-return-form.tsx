'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import {
  Input,
  NotificationBanner,
  ResumeErreurs,
} from '@/components/molecules'

import { useEnregistrerRetour } from '@/seances/application/seances.hooks'

export function FormRetour({
  seanceId,
  initial,
}: {
  seanceId: number
  initial: string
}) {
  const [texte, setTexte] = useState(initial)
  const [success, setSuccess] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const enregistrerRetour = useEnregistrerRetour(seanceId)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSuccess(false)
        setErreur(null)
        enregistrerRetour.mutate(texte, {
          onSuccess: () => setSuccess(true),
          onError: (err) => setErreur(err.message),
        })
      }}
    >
      {success && <NotificationBanner titre="Retour enregistré" type="success" />}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <Input
        as="textarea"
        hint="Texte libre. Ce retour sera visible par les parents."
        id="retour"
        label="Retour de séance"
        onChange={(e) => setTexte(e.target.value)}
        rows={4}
        value={texte}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button disabled={enregistrerRetour.isPending} type="submit">
          {enregistrerRetour.isPending ? 'Enregistrement…' : 'Enregistrer le retour'}
        </Button>
      </div>
    </form>
  )
}
