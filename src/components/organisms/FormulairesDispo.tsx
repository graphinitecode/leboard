'use client'

import { useState, useTransition } from 'react'

import { Bouton } from '@/components/atoms/Bouton'
import { ChampFormulaire, NotificationBanner, ResumeErreurs } from '@/components/molecules'

import {
  ajouterDisponibilite,
  supprimerDisponibilite,
} from '@/app/(frontend)/profs/disponibilites/actions'

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
      {succes && <NotificationBanner titre={succes} type="succes" />}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <div className="lpv-champs-inline">
        <div className="lpv-champs-inline__champ" style={{ maxWidth: '12rem' }}>
          <ChampFormulaire
            as="select"
            hint=" "
            id="dispo-jour"
            label="Jour"
            name="jour"
            options={OPTIONS_JOUR}
            required
          />
        </div>
        <div className="lpv-champs-inline__champ" style={{ maxWidth: '12rem' }}>
          <ChampFormulaire
            hint="par exemple 17:30"
            id="dispo-debut"
            label="De"
            name="heureDebut"
            pattern="\d{2}:\d{2}"
            required
          />
        </div>
        <div className="lpv-champs-inline__champ" style={{ maxWidth: '12rem' }}>
          <ChampFormulaire
            hint="par exemple 19:00"
            id="dispo-fin"
            label="À"
            name="heureFin"
            pattern="\d{2}:\d{2}"
            required
          />
        </div>
        <div className="lpv-champs-inline__champ" style={{ alignSelf: 'end' }}>
          <Bouton disabled={pending} type="submit">
            {pending ? 'Enregistrement…' : 'Ajouter'}
          </Bouton>
        </div>
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
        border: '1px solid var(--lpv-text)',
        borderRadius: 'var(--lpv-radius)',
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