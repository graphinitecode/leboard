'use client'

import { useState } from 'react'

import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

type LimitType = 'characters' | 'words'

// Molécule : compteur de caractères/mots. Inspiré de GOV.UK Character count.
// Affiche un message de compte sous le champ, ne bloque pas la saisie.
// Seuil : le message n'apparaît que quand le seuil (%) est dépassé.
// Annonce AT via aria-live="polite" quand le compteur change.
export function CharacterCount({
  id,
  name,
  label,
  hint,
  error,
  isPageHeading,
  limit,
  type = 'characters',
  threshold,
  value,
  onChange,
  rows = 5,
  optional = false,
  autoComplete,
}: {
  id: string
  name: string
  label: string
  hint?: string
  error?: string
  isPageHeading?: boolean
  limit: number
  type?: LimitType
  threshold?: number
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  optional?: boolean
  autoComplete?: string
}) {
  const [text, setText] = useState(value ?? '')
  const [exceededThreshold, setExceededThreshold] = useState(false)
  const limitReached = type === 'characters' ? text.length >= limit+1 : (text.trim().split(/\s+/).filter(Boolean).length >= limit)
  const currentCount = type === 'characters' ? text.length : text.trim().split(/\s+/).filter(Boolean).length
  const remaining = limit - currentCount

  function counterMessage(): string {
    if (limitReached) {
      return type === 'characters'
        ? `Vous avez dépassé de ${Math.abs(remaining)} caractère` +
            `${Math.abs(remaining) > 1 ? 's' : ''} la limite autorisée`
        : `Vous avez dépassé de ${Math.abs(remaining)} mot` +
            `${Math.abs(remaining) > 1 ? 's' : ''} la limite autorisée`
    }
    if (remaining === 0) {
      return `Vous avez atteint le maximum autorisé`
    }

    if (threshold && !exceededThreshold && currentCount < limit * (threshold / 100)) {
      return type === 'characters'
        ? `Vous pouvez saisir jusqu'à ${limit} caractères`
        : `Vous pouvez saisir jusqu'à ${limit} mots`
    }

    return type === 'characters'
      ? `Il vous reste ${remaining} caractère${remaining > 1 ? 's' : ''}`
      : `Il vous reste ${remaining} mot${remaining > 1 ? 's' : ''}`
  }

  function changeMessageColor(): string {
    if (remaining === 0) {
      return 'lpv-m-character-count__message--equal_limit'
    }
    if (remaining > 0) {
      if (remaining == limit) {
        return ` lpv-m-character-count__message--empty`
      }else{
        if (remaining > limit / 2) {
          return ` lpv-m-character-count__message--less_than_half_limit`
        }
        if (remaining <= limit/ 2) {
          return ` lpv-m-character-count__message--more_than_half_limit`
        }
      }


    }

    return ` lpv-m-character-count__message--error`
  }

  const groupClass = `lpv-form-group${error ? ' lpv-form-group--error' : ''} lpv-m-character-count`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${id}-hint`)
  if (error) ariaDescribedByParts.push(`${id}-error`)
  ariaDescribedByParts.push(`${id}-count`)
  const ariaDescribedBy = ariaDescribedByParts.join(' ')

  const labelElement = (
    <Label htmlFor={id} optional={optional} isPageHeading={isPageHeading}>
      {label}
    </Label>
  )

  return (
    <div
      className={groupClass}
      data-limit={limit}
      data-count-type={type}
      data-threshold={threshold}
    >
      {labelElement}
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage> : null}
      <textarea
        aria-describedby={ariaDescribedBy}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className={`lpv-a-textarea${error ? ' lpv-a-input--error' : ''} lpv-js-character-count`}
        defaultValue={value}
        id={id}
        name={name}
        onChange={(e) => {
          setText(e.target.value)
          const count =
            type === 'characters'
              ? e.target.value.length
              : e.target.value.trim().split(/\s+/).filter(Boolean).length
          setExceededThreshold(threshold ? count >= limit * (threshold / 100) : true)
          onChange?.(e)
        }}
        rows={rows}
        value={value !== undefined ? value : undefined}
      />
      <div
        aria-live="polite"
        className={`lpv-a-hint lpv-m-character-count__message${limitReached ? ' lpv-m-character-count__message--error' : ''} ${changeMessageColor()}`}
        id={`${id}-count`}
      >
        {counterMessage()}
      </div>
    </div>
  )
}
