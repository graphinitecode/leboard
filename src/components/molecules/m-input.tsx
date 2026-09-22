'use client'

import { useState, type ChangeEvent } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

// Molécule : champ de formulaire complet (Label + Hint + Erreur + contrôle).
// Convention : `optionnel` affiche « (optionnel) » dans le label ; un champ
// sans cette mention est obligatoire (attribut required appliqué au contrôle).
export function Input({
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
  min,
  max,
  rows = 4,
  options,
  isPageHeading,
  taille,
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
  min?: string
  max?: string
  rows?: number
  options?: { label: string; value: string }[]
  isPageHeading?: boolean
  taille?: 'l' | 'm' | 's'
}) {
  const describedBy = [hint ? `${id}-hint` : null, erreur ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  const required = !optionnel
  const classeErreur = erreur ? ' lpv-input--error' : ''
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`
  const [visible, setVisible] = useState(false)

  return (
    <div className={groupeClasse}>
      <Label htmlFor={id} optionnel={optionnel} isPageHeading={isPageHeading} taille={taille}>
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
      ) : type === 'password' ? (
        <div className="lpv-password">
          <input
            aria-describedby={describedBy || undefined}
            aria-invalid={erreur ? true : undefined}
            autoComplete={autoComplete}
            className={`lpv-input lpv-password__input${classeErreur}`}
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
            className="lpv-password__oeil"
            onClick={() => setVisible((v) => !v)}
            type="button"
          >
            <Icon icone={visible ? 'rivet-icons:eye-off' : 'rivet-icons:eye'} taille={26} />
          </button>
        </div>
      ) : (
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={erreur ? true : undefined}
          autoComplete={autoComplete}
          className={`lpv-input${classeErreur}`}
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
