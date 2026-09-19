'use client'

import { useState, useTransition } from 'react'

import {
  BandeauNotification,
  BoutonPrincipal,
  ChampSelect,
  ChampTexte,
  ResumeErreurs,
} from '@/components/govuk/Formulaires'

import { ajouterDisponibilite, supprimerDisponibilite } from './actions'

const OPTIONS_JOUR = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
]

export function FormDispo() {
  const [pending, startTransition] = useTransition()
  const [succes, setSucces] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setSucces(null)
        setErreur(null)
        startTransition(async () => {
          const result = await ajouterDisponibilite(formData)
          if (result.ok) {
            ;(e.target as HTMLFormElement).reset()
            setSucces('Disponibilité ajoutée')
          } else {
            setErreur(result.erreur ?? 'La disponibilité n’a pas pu être enregistrée.')
          }
        })
      }}
    >
      {succes && <BandeauNotification titre={succes} type="succes" />}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <div style={{ alignItems: 'end', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <ChampSelect
          id="dispo-jour"
          label="Jour"
          name="jour"
          options={OPTIONS_JOUR}
          required
        />
        <ChampTexte
          hint="Format 24h, par exemple 17:30"
          id="dispo-debut"
          label="De"
          name="heureDebut"
          pattern="\d{2}:\d{2}"
          required
        />
        <ChampTexte
          hint="Format 24h, par exemple 19:00"
          id="dispo-fin"
          label="À"
          name="heureFin"
          pattern="\d{2}:\d{2}"
          required
        />
        <BoutonPrincipal disabled={pending} type="submit">
          {pending ? 'Enregistrement…' : 'Ajouter'}
        </BoutonPrincipal>
      </div>
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
      style={{
        background: 'none',
        border: '1px solid #0b0c0c',
        borderRadius: 0,
        cursor: 'pointer',
        minHeight: 44,
        minWidth: 44,
      }}
      type="button"
    >
      {pending ? '…' : '✕'}
    </button>
  )
}