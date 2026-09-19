'use client'

import { useTransition } from 'react'

import { changerPresence } from './actions'

const OPTIONS = [
  { label: 'P', libelle: 'Présent', value: 'present' },
  { label: 'A', libelle: 'Absent', value: 'absent' },
  { label: 'J', libelle: 'Absent (justifié)', value: 'absent-justifie' },
]

// Toggle à un tap : boutons segmentés style GOV.UK (cibles ≥ 44 px, aria-pressed,
// pas de couleur seule pour communiquer l'état — libellé court visible).
export function TogglePresence({
  presenceId,
  statutInitial,
  nomEleve,
}: {
  presenceId: number | string
  statutInitial: string
  nomEleve: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div
      aria-label={`Présence de ${nomEleve}`}
      className="govfr-toggle"
      role="group"
    >
      {OPTIONS.map((option) => {
        const actif = statutInitial === option.value
        return (
          <button
            key={option.value}
            aria-label={option.libelle}
            aria-pressed={actif}
            className={`govfr-toggle-option${actif ? ' govfr-toggle-option--actif' : ''}`}
            disabled={pending}
            onClick={() => {
              if (actif) return
              startTransition(async () => {
                const result = await changerPresence(presenceId, option.value)
                if (!result.ok) {
                  window.alert(result.erreur)
                } else {
                  window.location.reload()
                }
              })
            }
            }
            title={option.libelle}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}