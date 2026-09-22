'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import {
  Input,
  NotificationBanner,
  ErrorSummary,
} from '@/components/molecules'
import { useAjouterProgression, useListCompetences, type NiveauProgression } from '@/progressions/application/progressions.hooks'

const OPTIONS_NIVEAU: { label: string; value: NiveauProgression }[] = [
  { label: 'Acquis', value: 'acquis' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'À revoir', value: 'a-revoir' },
]

export function ProgressionForm({
  seanceId,
  students,
}: {
  seanceId?: number
  students: { id: number; label: string }[]
}) {
  const competences = useListCompetences()
  const ajouter = useAjouterProgression(seanceId)
  const [success, setSuccess] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} type="button">
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
        setFormError(null)
        ajouter.mutate(
          {
            eleveId: Number(formData.get('student')),
            competenceId: Number(formData.get('competence')),
            niveau: String(formData.get('niveau')) as NiveauProgression,
            commentaire: String(formData.get('commentaire') ?? '') || undefined,
          },
          {
            onSuccess: () => {
              setSuccess('Progression enregistrée')
              setOpen(false)
            },
            onError: (err) => setFormError(err.message),
          },
        )
      }}
    >
      {success && <NotificationBanner title={success} type="success" />}
      <ErrorSummary errors={formError ? [formError] : []} />
      <Input
        as="select"
        hint="Seuls les élèves de cette séance sont proposés."
        id="student-progression"
        label="Élève"
        name="student"
        options={students.map((student) => ({ label: student.label, value: String(student.id) }))}
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
        optional
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
        <Button disabled={ajouter.isPending} type="submit">
          {ajouter.isPending ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
        <Button onClick={() => setOpen(false)} type="button" variant="secondary">
          Annuler
        </Button>
      </div>
    </form>
  )
}
