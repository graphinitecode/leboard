'use client'

import { useState, type ChangeEvent } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

// Molécule : champ de formulaire complet (Label + Hint + Erreur + contrôle).
// Convention : `optional` affiche « (optional) » dans le label ; un champ
// sans cette mention est obligatoire (attribut required appliqué au contrôle).
export function Input({
  as = 'input',
  label,
  hint,
  error,
  id,
  type = 'text',
  autoComplete,
  optional = false,
  name,
  defaultValue,
  value,
  onChange,
  pattern,
  min,
  max,
  rows = 4,
  options,
  isPageHeading,
  size,
}: {
  as?: 'input' | 'textarea' | 'select'
  label: string
  hint?: string
  error?: string
  id: string
  type?: string
  autoComplete?: string
  optional?: boolean
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  pattern?: string
  min?: string
  max?: string
  rows?: number
  options?: { label: string; value: string }[]
  isPageHeading?: boolean
  size?: 'l' | 'm' | 's'
}) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  const required = !optional
  const errorClass = error ? ' lpv-a-input--error' : ''
  const groupClass = `lpv-form-group${error ? ' lpv-form-group--error' : ''}`
  const [visible, setVisible] = useState(false)

  return (
    <div className={groupClass}>
      <Label htmlFor={id} optional={optional} isPageHeading={isPageHeading} size={size}>
        {label}
      </Label>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage> : null}

      {as === 'textarea' ? (
        <textarea
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={`lpv-a-textarea${errorClass}`}
          defaultValue={defaultValue}
          id={id}
          name={name ?? id}
          onChange={onChange as never}
          required={required}
          rows={rows}
          value={value}
        />
      ) : as === 'select' ? (
        <select
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className={`lpv-a-select${errorClass}`}
          defaultValue={defaultValue}
          id={id}
          name={name ?? id}
          onChange={onChange as never}
          required={required}
        >
          {(options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'password' ? (
        <div className="lpv-a-input--password-group">
          <input
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            autoComplete={autoComplete}
            className={`lpv-a-input lpv-a-input--password-input${errorClass}`}
            defaultValue={defaultValue}
            id={id}
            name={name ?? id}
            onChange={onChange as never}
            pattern={pattern}
            required={required}
            type={visible ? 'text' : 'password'}
            value={value}
          />
          <button
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={visible}
            className="lpv-a-input--password-toggle"
            onClick={() => setVisible((v) => !v)}
            type="button"
          >
            <Icon icon={visible ? 'rivet-icons:eye-off' : 'rivet-icons:eye'} size={26} />
          </button>
        </div>
      ) : (
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          autoComplete={autoComplete}
          className={`lpv-a-input${errorClass}`}
          defaultValue={defaultValue}
          id={id}
          max={max}
          min={min}
          name={name ?? id}
          onChange={onChange as never}
          pattern={pattern}
          required={required}
          type={type}
          value={value}
        />
      )}
    </div>
  )
}
