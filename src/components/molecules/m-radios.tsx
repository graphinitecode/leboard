'use client'

import { useState } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/a-label'

type LegendSize = 'l' | 'm' | 's'

export type RadioOption = {
  value: string
  label: string
  hint?: string
  divider?: never
  conditional?: React.ReactNode
  disabled?: boolean
} | {
  divider: string
  value?: never
  label?: never
  hint?: never
  conditional?: never
  disabled?: never
}

// Molécule : boutons radio. Inspiré de GOV.UK Radios.
// - Fieldset + legend (isPageHeading possible)
// - Divider « ou »
// - Variante inline pour 2 options courtes
// - Révélation conditionnelle
// - Small pour filtres de résultats
export function Radios({
  name,
  options,
  idPrefix,
  hint,
  error,
  value,
  isPageHeading,
  legendSize = 'l',
  inline = false,
  small = false,
  onChange,
}: {
  name: string
  options: RadioOption[]
  idPrefix?: string
  hint?: string
  error?: string
  value?: string
  isPageHeading?: boolean
  legendSize?: LegendSize
  inline?: boolean
  small?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const prefix = idPrefix ?? name
  const groupClass = `lpv-form-group${error ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${prefix}-hint`)
  if (error) ariaDescribedByParts.push(`${prefix}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined
  const containerClass = `lpv-m-radios${inline ? ' lpv-m-radios--inline' : ''}${small ? ' lpv-m-radios--small' : ''}`

  const [revealedConditional, setRevealedConditional] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    options.forEach((opt) => {
      if (opt.conditional && value === opt.value) {
        init[opt.value] = true
      }
    })
    return init
  })

  return (
    <div className={groupClass}>
      <fieldset aria-describedby={ariaDescribedBy} className="lpv-fieldset">
        {isPageHeading ? (
          <legend className={`lpv-fieldset__legende${legendSize !== 'l' ? ` lpv-fieldset__legende--${legendSize}` : ''}`}>
            <h1 className="lpv-fieldset__titre">{name}</h1>
          </legend>
        ) : (
          <legend className={`lpv-fieldset__legende${legendSize !== 'l' ? ` lpv-fieldset__legende--${legendSize}` : ''}`}>
            {name}
          </legend>
        )}
        {hint ? <Hint id={`${prefix}-hint`}>{hint}</Hint> : null}
        {error ? <ErrorMessage id={`${prefix}-error`}>{error}</ErrorMessage> : null}
        <div className={containerClass}>
          {options.map((option, index) => {
            if (option.divider) {
              return (
                <div className="lpv-m-radios__divider" key={`divider-${index}`}>
                  {option.divider}
                </div>
              )
            }

            const optionId = `${prefix}-${index + 1}`
            const hintId = option.hint ? `${optionId}-hint` : undefined
            const conditionalId = option.conditional ? `${optionId}-conditional` : undefined

            return (
              <div key={option.value}>
                <div className="lpv-m-radios__item">
                  <input
                    aria-describedby={hintId}
                    checked={value === option.value}
                    className="lpv-m-radios__input"
                    data-aria-controls={conditionalId}
                    disabled={option.disabled}
                    id={optionId}
                    name={name}
                    onChange={(e) => {
                      const newRevealed: Record<string, boolean> = {}
                      options.forEach((opt) => {
                        if (opt.conditional) {
                          newRevealed[opt.value] = opt.value === e.target.value
                        }
                      })
                      setRevealedConditional(newRevealed)
                      onChange?.(e)
                    }}
                    type="radio"
                    value={option.value}
                  />
                  <label className="lpv-label lpv-m-radios__label" htmlFor={optionId}>
                    {option.label}
                  </label>
                  {option.hint ? (
                    <div className="lpv-hint lpv-m-radios__hint" id={hintId}>
                      {option.hint}
                    </div>
                  ) : null}
                </div>
                {option.conditional ? (
                  <div
                    className={`lpv-m-radios__conditional${revealedConditional[option.value] ? '' : ' lpv-m-radios__conditional--hidden'}`}
                    id={conditionalId}
                  >
                    {option.conditional}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
