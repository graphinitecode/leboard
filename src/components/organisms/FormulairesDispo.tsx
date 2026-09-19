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

// Organisme : ajout/suppression de disponibilités hebdomadaires.
// Structure mobile-first : jour en pleine largeur, De/À côte à côte (time pickers
// natifs), bouton pleine largeur. Sur desktop, tout tient sur une ligne alignée.
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
        <div className="lpv-champs-inline__pleine">
          <ChampFormulaire
            as="select"
            id="dispo-jour"
            label="Jour"
            name="jour"
            options={OPTIONS_JOUR}
            required
          />
        </div>
        <div className="lpv-champs-inline__moitie">
          <ChampFormulaire
            hint="Heure de début"
            id="dispo-debut"
            label="De"
            name="heureDebut"
            required
            type="time"
          />
        </div>
        <div className="lpv-champs-inline__moitie">
          <ChampFormulaire
            hint="Heure de fin"
            id="dispo-fin"
            label="À"
            name="heureFin"
            required
            type="time"
          />
        </div>
        <div className="lpv-champs-inline__pleine">
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