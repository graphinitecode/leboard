'use client'

import { useTransition } from 'react'

import { Bouton } from '@/components/atoms/Bouton'

export interface OptionSegmentee {
  label: string
  libelle: string
  value: string
}

// Molécule : toggle segmenté (un tap), générique.
// L'état actif est communiqué par la couleur + le graisse + aria-pressed (jamais la couleur seule).
export function ToggleSegmentes({
  options,
  valeurInitiale,
  onChanger,
  ariaLabel,
  attributData,
}: {
  options: OptionSegmentee[]
  valeurInitiale: string
  onChanger: (valeur: string) => Promise<{ ok: boolean; erreur?: string }>
  ariaLabel: string
  attributData?: (option: OptionSegmentee) => Record<string, string>
}) {
  const [pending, startTransition] = useTransition()

  return (
    <div aria-label={ariaLabel} className="lpv-toggle" role="group">
      {options.map((option) => {
        const actif = valeurInitiale === option.value
        const dataProps = attributData?.(option) ?? {}

        return (
          <button
            key={option.value}
            aria-label={option.libelle}
            aria-pressed={actif}
            className={`lpv-toggle-option${actif ? ' lpv-toggle-option--actif' : ''}`}
            disabled={pending}
            onClick={() => {
              if (actif) return
              startTransition(async () => {
                const result = await onChanger(option.value)
                if (!result.ok) {
                  window.alert(result.erreur)
                } else {
                  window.location.reload()
                }
              })
            }}
            title={option.libelle}
            type="button"
            {...dataProps}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}