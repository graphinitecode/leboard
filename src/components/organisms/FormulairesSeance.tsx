'use client'

import { useState, useTransition } from 'react'

import { Bouton } from '@/components/atoms/Bouton'
import {
  ChampFormulaire,
  NotificationBanner,
  ResumeErreurs,
} from '@/components/molecules'

import {
  ajouterProgression,
  enregistrerRetour,
} from '@/app/(frontend)/profs/seances/[id]/actions'

const OPTIONS_NIVEAU = [
  { label: 'Acquis', value: 'acquis' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'À revoir', value: 'a-revoir' },
]

export function FormRetour({ seanceId, initial }: { seanceId: number | string; initial: string }) {
  const [texte, setTexte] = useState(initial)
  const [success, setSuccess] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSuccess(false)
        setErreur(null)
        startTransition(async () => {
          const result = await enregistrerRetour(seanceId, texte)
          if (result.ok) {
            setSuccess(true)
          } else {
            setErreur(result.erreur ?? 'Le retour n’a pas pu être enregistré.')
          }
        })
      }}
    >
      {success && <NotificationBanner titre="Retour enregistré" type="success" />}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <ChampFormulaire
        as="textarea"
        hint="Texte libre. Ce retour sera visible par les parents."
        id="retour"
        label="Retour de séance"
        onChange={(e) => setTexte(e.target.value)}
        rows={4}
        value={texte}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Bouton disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Enregistrer le retour'}
        </Bouton>
      </div>
    </form>
  )
}

export function FormProgression({
  seanceId,
  eleves,
  competences,
}: {
  seanceId: number | string
  eleves: { id: number | string; label: string }[]
  competences: { id: number | string; label: string; matiere?: string }[]
}) {
  const [success, setSuccess] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [ouvert, setOuvert] = useState(false)
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null)

  if (!ouvert) {
    return (
      <Bouton onClick={() => setOuvert(true)} type="button">
        Ajouter une progression
      </Bouton>
    )
  }

  return (
    <form
      className="lpv-card"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('seance', String(seanceId))
        setSuccess(null)
        setErreurFormulaire(null)
        startTransition(async () => {
          const result = await ajouterProgression(formData)
          if (result.ok) {
            setSuccess('Progression enregistrée')
            setOuvert(false)
          } else {
            setErreurFormulaire(result.erreur ?? 'La progression n’a pas pu être enregistrée.')
          }
        })
      }}
    >
      {success && <NotificationBanner titre={success} type="success" />}
      <ResumeErreurs erreurs={erreurFormulaire ? [erreurFormulaire] : []} />
      <ChampFormulaire
        as="select"
        hint="Seuls les élèves de cette séance sont proposés."
        id="eleve-progression"
        label="Élève"
        name="eleve"
        options={eleves.map((eleve) => ({ label: eleve.label, value: String(eleve.id) }))}

      />
      <ChampFormulaire
        as="select"
        hint="Liste gérée par l’association."
        id="competence-progression"
        label="Compétence"
        name="competence"
        options={competences.map((competence) => ({
          label: competence.matiere ? `${competence.label} (${competence.matiere})` : competence.label,
          value: String(competence.id),
        }))}

      />
      <ChampFormulaire as="select" id="niveau-progression" label="Niveau" name="niveau" options={OPTIONS_NIVEAU} />
      <ChampFormulaire
        hint="Observation courte, visible par la famille."
        id="commentaire-progression"
        label="Commentaire"
        name="commentaire"
        optionnel
      />
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start' }}>
        <Bouton disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </Bouton>
        <Bouton onClick={() => setOuvert(false)} type="button" variante="secondaire">
          Annuler
        </Bouton>
      </div>
    </form>
  )
}
