'use client'

import { useState, useTransition } from 'react'

import { ajouterDisponibilite, supprimerDisponibilite } from './actions'

export function FormDispo() {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setMessage(null)
        startTransition(async () => {
          const result = await ajouterDisponibilite(formData)
          if (result.ok) {
            ;(e.target as HTMLFormElement).reset()
            setMessage('Disponibilité ajoutée')
          } else {
            setMessage(result.erreur ?? 'Échec')
          }
        })
      }}
      style={{ alignItems: 'end', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
    >
      <label>
        Jour
        <select name="jour" required defaultValue="mercredi">
          <option value="lundi">Lundi</option>
          <option value="mardi">Mardi</option>
          <option value="mercredi">Mercredi</option>
          <option value="jeudi">Jeudi</option>
          <option value="vendredi">Vendredi</option>
          <option value="samedi">Samedi</option>
        </select>
      </label>
      <label>
        De
        <input name="heureDebut" pattern="\d{2}:\d{2}" placeholder="17:30" required />
      </label>
      <label>
        À
        <input name="heureFin" pattern="\d{2}:\d{2}" placeholder="19:00" required />
      </label>
      <button disabled={pending} type="submit">
        {pending ? '…' : 'Ajouter'}
      </button>
      {message && <span>{message}</span>}
    </form>
  )
}

export function BoutonSupprimerDispo({ index }: { index: number }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      aria-label="Supprimer cette disponibilité"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await supprimerDisponibilite(index)
        })
      }
      type="button"
    >
      {pending ? '…' : '✕'}
    </button>
  )
}