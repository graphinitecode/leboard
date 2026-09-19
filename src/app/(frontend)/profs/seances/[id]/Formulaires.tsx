'use client'

import { useState, useTransition } from 'react'

import { ajouterProgression, enregistrerRetour } from './actions'

export function FormRetour({ seanceId, initial }: { seanceId: number | string; initial: string }) {
  const [texte, setTexte] = useState(initial)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setMessage(null)
        startTransition(async () => {
          const result = await enregistrerRetour(seanceId, texte)
          setMessage(result.ok ? 'Enregistré' : result.erreur ?? 'Échec')
        })
      }}
      style={{ display: 'grid', gap: '0.5rem' }}
    >
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={4}
        placeholder="Compte-rendu de la séance…"
        defaultValue={initial}
      />
      <div style={{ alignItems: 'center', display: 'flex', gap: '0.75rem' }}>
        <button type="submit" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer le retour'}
        </button>
        {message && <span>{message}</span>}
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
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [ouvert, setOuvert] = useState(false)

  if (!ouvert) {
    return (
      <button onClick={() => setOuvert(true)} type="button">
        + Ajouter une progression
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        formData.set('seance', String(seanceId))
        setMessage(null)
        startTransition(async () => {
          const result = await ajouterProgression(formData)
          if (result.ok) {
            setMessage('Progression enregistrée')
            setOuvert(false)
          } else {
            setMessage(result.erreur ?? 'Échec de l’enregistrement.')
          }
        })
      }}
      style={{ border: '1px solid #ddd', borderRadius: 8, display: 'grid', gap: '0.5rem', padding: '0.75rem' }}
    >
      <label>
        Élève
        <select name="eleve" required>
          {eleves.map((eleve) => (
            <option key={String(eleve.id)} value={String(eleve.id)}>
              {eleve.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Compétence
        <select name="competence" required>
          {competences.map((competence) => (
            <option key={String(competence.id)} value={String(competence.id)}>
              {competence.label}
              {competence.matiere ? ` (${competence.matiere})` : ''}
            </option>
          ))}
        </select>
      </label>
      <label>
        Niveau
        <select name="niveau" required defaultValue="en-cours">
          <option value="acquis">Acquis</option>
          <option value="en-cours">En cours</option>
          <option value="a-revoir">À revoir</option>
        </select>
      </label>
      <label>
        Commentaire
        <input name="commentaire" type="text" placeholder="Observation courte (visible par la famille)" />
      </label>
      <div style={{ alignItems: 'center', display: 'flex', gap: '0.75rem' }}>
        <button disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={() => setOuvert(false)} type="button">
          Annuler
        </button>
        {message && <span>{message}</span>}
      </div>
    </form>
  )
}