'use client'

import { useState } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/a-label'

type LegendSize = 'l' | 'm' | 's'

export type CheckboxOption = {
  value: string
  label: string
  hint?: string
  checked?: boolean
  divider?: never
  conditional?: React.ReactNode
  disabled?: boolean
} | {
  divider: string
  value?: never
  label?: never
  hint?: never
  checked?: never
  conditional?: never
  disabled?: never
}

// Molécule : une option de case à cocher avec révélation conditionnelle.
// Composant séparé pour respecter les règles des hooks (pas de useState dans une boucle).
function OptionWithRevelation({
  option,
  optionId,
  hintId,
  conditionalId,
  name,
  onExternalChange,
}: {
  option: CheckboxOption & { divider?: never }
  optionId: string
  hintId: string | undefined
  conditionalId: string | undefined
  name: string
  onExternalChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [revealed, setRevealed] = useState(option.checked ?? false)

  return (
    <div key={option.value}>
      <div className="lpv-m-checkbox__item">
        <input
          aria-describedby={hintId}
          checked={option.checked}
          className="lpv-m-checkbox__input"
          data-aria-controls={conditionalId}
          disabled={option.disabled}
          id={optionId}
          name={name}
          onChange={(e) => {
            setRevealed(e.target.checked)
            onExternalChange?.(e)
          }}
          type="checkbox"
          value={option.value}
        />
        <label className="lpv-label lpv-m-checkbox__label" htmlFor={optionId}>
          {option.label}
        </label>
        {option.hint ? (
          <div className="lpv-hint lpv-m-checkbox__hint" id={hintId}>
            {option.hint}
          </div>
        ) : null}
      </div>
      {option.conditional ? (
        <div
          className={`lpv-m-checkbox__conditionnel${revealed ? '' : ' lpv-m-checkbox__conditionnel--hidden'}`}
          id={conditionalId}
        >
          {option.conditional}
        </div>
      ) : null}
    </div>
  )
}

export function Checkbox({
  name,
  options,
  idPrefix,
  hint,
  error,
  isPageHeading,
  legendSize = 'l',
  onChange,
}: {
  name: string
  options: CheckboxOption[]
  idPrefix?: string
  hint?: string
  error?: string
  isPageHeading?: boolean
  legendSize?: LegendSize
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const prefix = idPrefix ?? name
  const groupClass = `lpv-form-group${error ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${prefix}-hint`)
  if (error) ariaDescribedByParts.push(`${prefix}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined

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
        <div className="lpv-m-checkbox">
          {options.map((option, index) => {
            if (option.divider) {
              return (
                <div className="lpv-m-checkbox__diviseur" key={`divider-${index}`}>
                  {option.divider}
                </div>
              )
            }

            const optionId = `${prefix}-${index + 1}`
            const hintId = option.hint ? `${optionId}-hint` : undefined
            const conditionalId = option.conditional ? `${optionId}-conditional` : undefined

            return (
              <OptionWithRevelation
                conditionalId={conditionalId}
                hintId={hintId}
                key={option.value}
                name={name}
                onExternalChange={onChange}
                option={option as CheckboxOption & { divider?: never; value: string; label: string }}
                optionId={optionId}
              />
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
