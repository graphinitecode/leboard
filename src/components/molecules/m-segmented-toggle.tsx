'use client'

import { useState } from 'react'

export interface SegmentedOption {
  label: string
  ariaLabel: string
  value: string
}

// Molécule : toggle segmenté (un tap), générique.
// L'état actif est communiqué par la couleur + le graisse + aria-pressed (jamais la couleur seule).
export function SegmentedToggle({
  options,
  initialValue,
  onChange,
  ariaLabel,
  dataAttribute,
}: {
  options: SegmentedOption[]
  initialValue: string
  onChange: (value: string) => void
  ariaLabel: string
  dataAttribute?: (option: SegmentedOption) => Record<string, string>
}) {
  const [pendingLocal, setPendingLocal] = useState<string | null>(null)

  return (
    <div aria-label={ariaLabel} className="lpv-toggle" role="group">
      {options.map((option) => {
        const active = initialValue === option.value
        const dataProps = dataAttribute?.(option) ?? {}

        return (
          <button
            key={option.value}
            aria-label={option.ariaLabel}
            aria-pressed={active}
            className={`lpv-toggle-option${active ? ' lpv-toggle-option--active' : ''}`}
            disabled={pendingLocal !== null}
            onClick={() => {
              if (active || pendingLocal !== null) return
              setPendingLocal(option.value)
              try {
                onChange(option.value)
              } finally {
                setPendingLocal(null)
              }
            }}
            title={option.ariaLabel}
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