'use client'

import type { ChangeEvent } from 'react'

import { ErrorMessage, Hint, Label } from '@/components/atoms/Champ'

// Molécule : champ de formulaire complet (Label + Hint + Erreur + contrôle).
// Convention : `optionnel` affiche « (optionnel) » dans le label ; un champ
// sans cette mention est obligatoire (attribut required appliqué au contrôle).
export function ChampFormulaire({
  as = 'input',
  label,
  hint,
  erreur,
  id,
  type = 'text',
  autoComplete,
  optionnel = false,
  name,
  defaultValue,
  value,
  onChange,
  pattern,
  rows = 4,
  options,
}: {
  as?: 'input' | 'textarea' | 'select'
  label: string
  hint?: string
  erreur?: string
  id: string
  type?: string
  autoComplete?: string
  optionnel?: boolean
  name?: string
  defaultValue?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  pattern?: string
  rows?: number
  options?: { label: string; value: string }[]
}) {
  const describedBy = [hint ? `${id}-hint` : null, erreur ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  const required = !optionnel
  const classeErreur = erreur ? ' lpv-input--error' : ''
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`

  return (
    <div className={groupeClasse}>
      <Label htmlFor={id} optionnel={optionnel}>
        {label}
      </Label>
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {erreur ? <ErrorMessage id={`${id}-error`}>{erreur}</ErrorMessage> : null}

      {as === 'textarea' ? (
        <textarea
          aria-describedby={describedBy || undefined}
          aria-invalid={erreur ? true : undefined}
          className={`lpv-textarea${classeErreur}`}
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
          aria-invalid={erreur ? true : undefined}
          className={`lpv-select${classeErreur}`}
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
      ) : (
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={erreur ? true : undefined}
          autoComplete={autoComplete}
          className={`lpv-input${classeErreur}`}
          defaultValue={defaultValue}
          id={id}
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