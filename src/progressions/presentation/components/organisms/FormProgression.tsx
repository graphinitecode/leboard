'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import {
  Input,
  NotificationBanner,
  ResumeErreurs,
} from '@/components/molecules'
import { useAjouterProgression, useListCompetences, type NiveauProgression } from '@/progressions/application/progressions.hooks'

const OPTIONS_NIVEAU: { label: string; value: NiveauProgression }[] = [
  { label: 'Acquis', value: 'acquis' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'À revoir', value: 'a-revoir' },
]

export function FormProgression({
  seanceId,
  eleves,
}: {
  seanceId?: number
  eleves: { id: number; label: string }[]
}) {
  const competences = useListCompetences()
  const ajouter = useAjouterProgression(seanceId)
  const [success, setSuccess] = useState<string | null>(null)
  const [ouvert, setOuvert] = useState(false)
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null)

  if (!ouvert) {
    return (
      <Button onClick={() => setOuvert(true)} type="button">
        Ajouter une progression
      </Button>
    )
  }

  return (
    <form
      className="lpv-card"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setSuccess(null)
        setErreurFormulaire(null)
        ajouter.mutate(
          {
            eleveId: Number(formData.get('eleve')),
            competenceId: Number(formData.get('competence')),
            niveau: String(formData.get('niveau')) as NiveauProgression,
            commentaire: String(formData.get('commentaire') ?? '') || undefined,
          },
          {
            onSuccess: () => {
              setSuccess('Progression enregistrée')
              setOuvert(false)
            },
            onError: (err) => setErreurFormulaire(err.message),
          },
        )
      }}
    >
      {success && <NotificationBanner titre={success} type="success" />}
      <ResumeErreurs erreurs={erreurFormulaire ? [erreurFormulaire] : []} />
      <Input
        as="select"
        hint="Seuls les élèves de cette séance sont proposés."
        id="eleve-progression"
        label="Élève"
        name="eleve"
        options={eleves.map((eleve) => ({ label: eleve.label, value: String(eleve.id) }))}
      />
      <Input
        as="select"
        hint="Liste gérée par l’association."
        id="competence-progression"
        label="Compétence"
        name="competence"
        options={competences.data?.map((competence) => ({
          label: competence.matiere ? `${competence.label} (${competence.matiere})` : competence.label,
          value: String(competence.id),
        })) ?? []}
      />
      <Input as="select" id="niveau-progression" label="Niveau" name="niveau" options={OPTIONS_NIVEAU} />
      <Input
        hint="Observation courte, visible par la famille."
        id="commentaire-progression"
        label="Commentaire"
        name="commentaire"
        optionnel
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
        <Button disabled={ajouter.isPending} type="submit">
          {ajouter.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button onClick={() => setOuvert(false)} type="button" variante="secondaire">
          Annuler
        </Button>
      </div>
    </form>
  )
}
