'use client'

import { useState, useTransition } from 'react'

import {
  BandeauNotification,
  BoutonPrincipal,
  ChampSelect,
  ChampTexte,
  ChampTexteLong,
  ResumeErreurs,
} from '@/components/govuk/Formulaires'

import { ajouterProgression, enregistrerRetour } from './actions'

const OPTIONS_NIVEAU = [
  { label: 'Acquis', value: 'acquis' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'À revoir', value: 'a-revoir' },
]

export function FormRetour({ seanceId, initial }: { seanceId: number | string; initial: string }) {
  const [texte, setTexte] = useState(initial)
  const [succes, setSucces] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSucces(false)
        setErreur(null)
        startTransition(async () => {
          const result = await enregistrerRetour(seanceId, texte)
          if (result.ok) {
            setSucces(true)
          } else {
            setErreur(result.erreur ?? 'Le retour n’a pas pu être enregistré.')
          }
        })
      }}
    >
      {succes && <BandeauNotification titre="Retour enregistré" type="succes" />}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <ChampTexteLong
        hint="Texte libre. Ce retour sera visible par les parents."
        id="retour"
        label="Retour de séance"
        onChange={(e) => setTexte(e.target.value)}
        rows={4}
        value={texte}
      />
      <BoutonPrincipal disabled={pending} type="submit">
        {pending ? 'Enregistrement…' : 'Enregistrer le retour'}
      </BoutonPrincipal>
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
  const [message, setMessage] = useState<{ succes?: boolean; texte?: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [ouvert, setOuvert] = useState(false)
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null)

  if (!ouvert) {
    return (
      <BoutonPrincipal onClick={() => setOuvert(true)} type="button">
        Ajouter une progression
      </BoutonPrincipal>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('seance', String(seanceId))
        setMessage(null)
        setErreurFormulaire(null)
        startTransition(async () => {
          const result = await ajouterProgression(formData)
          if (result.ok) {
            setMessage({ succes: true, texte: 'Progression enregistrée' })
            setOuvert(false)
          } else {
            setErreurFormulaire(result.erreur ?? 'La progression n’a pas pu être enregistrée.')
          }
        })
      }}
      style={{ border: '1px solid #b1b4b6', padding: '1rem' }}
    >
      {message?.succes && <BandeauNotification titre={message.texte!} type="succes" />}
      <ResumeErreurs erreurs={erreurFormulaire ? [erreurFormulaire] : []} />
      <ChampSelect
        hint="Seuls les élèves de cette séance sont proposés."
        id="eleve-progression"
        label="Élève"
        name="eleve"
        options={eleves.map((eleve) => ({ label: eleve.label, value: String(eleve.id) }))}
        required
      />
      <ChampSelect
        hint="Liste gérée par l’association."
        id="competence-progression"
        label="Compétence"
        name="competence"
        options={competences.map((competence) => ({
          label: competence.matiere ? `${competence.label} (${competence.matiere})` : competence.label,
          value: String(competence.id),
        }))}
        required
      />
      <ChampSelect
        id="niveau-progression"
        label="Niveau"
        name="niveau"
        options={OPTIONS_NIVEAU}
        required
      />
      <ChampTexte
        hint="Observation courte, visible par la famille."
        id="commentaire-progression"
        label="Commentaire"
        name="commentaire"
      />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <BoutonPrincipal disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </BoutonPrincipal>
        <button className="govfr-bouton govfr-bouton--secondaire" onClick={() => setOuvert(false)} type="button">
          Annuler
        </button>
      </div>
    </form>
  )
}