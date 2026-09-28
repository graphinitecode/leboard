import type { ReactNode } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/a-label'

type LegendSize = 'l' | 'm' | 's'

// Molécule : ensemble de champs (<fieldset> + <legend>).
// Utilisée par Checkbox, Radios, DateInput, et tout groupe
// de champs apparentés (ex. adresse).
//
// Guide GOV.UK « Making labels and legends headings » :
// - isPageHeading place le <h1> DANS la <legend> (pas autour).
// - size pilote la classe de légende : 'l' (défaut), 'm', 's'.
// - Le fieldset regroupe visuellement et accessiblement les champs du groupe.
// - describedBy relie le fieldset au hint et/ou à l'erreur du groupe.
export function InputField({
  children,
  legend,
  size = 'l',
  isPageHeading,
  hint,
  error,
  describedBy,
  role,
}: {
  children: ReactNode
  legend: string
  size?: LegendSize
  isPageHeading?: boolean
  hint?: string
  error?: string
  describedBy?: string
  role?: string
}) {
  const sizeClass = size !== 'l' ? ` lpv-fieldset__legend--${size}` : ''
  const ids: string[] = []
  if (hint) ids.push(`${describedBy ?? ''}-hint`)
  if (error) ids.push(`${describedBy ?? ''}-error`)
  const ariaDescribedBy = ids.length > 0 ? ids.join(' ') : undefined

  return (
    <fieldset
      aria-describedby={ariaDescribedBy}
      className="lpv-fieldset"
      role={role}
    >
      <legend className={`lpv-fieldset__legend${sizeClass}`}>
        {isPageHeading ? <h1 className="lpv-fieldset__title">{legend}</h1> : legend}
      </legend>
      {hint ? <Hint id={`${describedBy ?? ''}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${describedBy ?? ''}-error`}>{error}</ErrorMessage> : null}
      {children}
    </fieldset>
  )
}
