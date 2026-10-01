'use client'

import { useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'

export interface SegmentedOption {
  ariaLabel: string
  /** Icône (nom Iconify) affichée à la place du libellé, ou à ses côtés. */
  icon?: string
  /** Facultatif : une option peut être icon-only (ariaLabel la nomme). */
  label?: string
  value: string
}

// Molécule : toggle segmenté (un tap), générique.
// Une option affiche son libellé, son icône, ou les deux.
// L'état actif est communiqué par la couleur + la graisse + aria-pressed (jamais la couleur seule).
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

        const iconModifier = option.icon
          ? option.label
            ? ' lpv-toggle-option--icon'
            : ' lpv-toggle-option--icon-only'
          : ''

        return (
          <button
            key={option.value}
            aria-label={option.ariaLabel}
            aria-pressed={active}
            className={`lpv-toggle-option${active ? ' lpv-toggle-option--active' : ''}${iconModifier}`}
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
            {option.icon && (
              <Icon
                aria-hidden
                icon={option.icon}
                size={option.label ? 16 : 20}
              />
            )}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}