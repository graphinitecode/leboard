'use client'

import { useTransition } from 'react'

import { changerPresence } from './actions'

const OPTIONS = [
  { label: 'P', title: 'Présent', value: 'present' },
  { label: 'A', title: 'Absent', value: 'absent' },
  { label: 'J', title: 'Absent (justifié)', value: 'absent-justifie' },
]

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
      role="group"
      style={{ display: 'flex', gap: '0.25rem' }}
    >
      {OPTIONS.map((option) => {
        const actif = statutInitial === option.value
        return (
          <button
            key={option.value}
            title={option.title}
            aria-label={option.title}
            aria-pressed={actif}
            disabled={pending}
            onClick={() => {
              if (actif) return
              startTransition(async () => {
                const result = await changerPresence(presenceId, option.value)
                if (!result.ok) {
                  alert(result.erreur)
                } else {
                  // Recharge léger pour synchroniser l'état visuel
                  window.location.reload()
                }
              })
            }}
            style={{
              border: '1px solid #ccc',
              borderRadius: 6,
              cursor: actif ? 'default' : 'pointer',
              minWidth: 44,
              minHeight: 44,
              fontWeight: actif ? 700 : 400,
              opacity: pending ? 0.6 : 1,
              background: actif
                ? option.value === 'present'
                  ? '#e6f6e6'
                  : option.value === 'absent-justifie'
                    ? '#fff7e0'
                    : '#fdeaea'
                : 'white',
            }}
            type="button"
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}