'use client'

import { useState } from 'react'

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
  onChanger: (valeur: string) => void
  ariaLabel: string
  attributData?: (option: OptionSegmentee) => Record<string, string>
}) {
  const [actifLocal, setActifLocal] = useState<string | null>(null)

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
            disabled={actifLocal !== null}
            onClick={() => {
              if (actif || actifLocal !== null) return
              setActifLocal(option.value)
              try {
                onChanger(option.value)
              } finally {
                setActifLocal(null)
              }
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