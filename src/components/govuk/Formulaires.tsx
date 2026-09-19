// Composants de formulaire inspirés du GOV.UK Design System (alphagov/govuk-frontend v6.5.0)
// Adaptés au français. Principes respectés :
// - https://design-system.service.gov.uk/components/text-input/ (label au-dessus, hint, erreur)
// - https://design-system.service.gov.uk/components/error-message/ (+ error summary)
// - https://www.gov.uk/service-manual/design/writing-for-user-interfaces (phrase simple, pas de « veuillez »)

import React from 'react'

// --- Champ texte / email / password ----------------------------------------

export function ChampTexte({
  label,
  hint,
  erreur,
  id,
  type = 'text',
  autoComplete,
  required,
  value,
  onChange,
  name,
  defaultValue,
  pattern,
  placeholder,
}: {
  label: string
  hint?: string
  erreur?: string
  id: string
  type?: string
  autoComplete?: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  defaultValue?: string
  pattern?: string
  placeholder?: string
}) {
  const classeErreur = erreur ? 'govfr-input--error' : ''

  return (
    <div className={`govfr-form-group${erreur ? ' govfr-form-group--error' : ''}`}>
      <label className="govfr-label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint && (
        <div className="govfr-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {erreur && (
        <p className="govfr-error-message" id={`${id}-error`}>
          {erreur}
        </p>
      )}
      <input
        aria-describedby={[hint ? `${id}-hint` : null, erreur ? `${id}-error` : null]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={erreur ? true : undefined}
        autoComplete={autoComplete}
        className={`govfr-input ${classeErreur}`}
        defaultValue={defaultValue}
        id={id}
        name={name ?? id}
        onChange={onChange}
        pattern={pattern}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </div>
  )
}

// --- Textarea ---------------------------------------------------------------

export function ChampTexteLong({
  label,
  hint,
  erreur,
  id,
  rows = 4,
  name,
  defaultValue,
  required,
  onChange,
  value,
}: {
  label: string
  hint?: string
  erreur?: string
  id: string
  rows?: number
  name?: string
  defaultValue?: string
  required?: boolean
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  value?: string
}) {
  return (
    <div className={`govfr-form-group${erreur ? ' govfr-form-group--error' : ''}`}>
      <label className="govfr-label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint && (
        <div className="govfr-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {erreur && (
        <p className="govfr-error-message" id={`${id}-error`}>
          {erreur}
        </p>
      )}
      <textarea
        aria-describedby={[hint ? `${id}-hint` : null, erreur ? `${id}-error` : null]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={erreur ? true : undefined}
        className={`govfr-input govfr-textarea ${erreur ? 'govfr-input--error' : ''}`}
        defaultValue={defaultValue}
        id={id}
        name={name ?? id}
        onChange={onChange}
        required={required}
        rows={rows}
        value={value}
      />
    </div>
  )
}

// --- Select -------------------------------------------------------------------

export function ChampSelect({
  label,
  hint,
  erreur,
  id,
  options,
  name,
  defaultValue,
  required,
  onChange,
}: {
  label: string
  hint?: string
  erreur?: string
  id: string
  options: { label: string; value: string }[]
  name?: string
  defaultValue?: string
  required?: boolean
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
  return (
    <div className={`govfr-form-group${erreur ? ' govfr-form-group--error' : ''}`}>
      <label className="govfr-label" htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint && (
        <div className="govfr-hint" id={`${id}-hint`}>
          {hint}
        </div>
      )}
      {erreur && (
        <p className="govfr-error-message" id={`${id}-error`}>
          {erreur}
        </p>
      )}
      <select
        aria-describedby={[hint ? `${id}-hint` : null, erreur ? `${id}-error` : null]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={erreur ? true : undefined}
        className={`govfr-select ${erreur ? 'govfr-input--error' : ''}`}
        defaultValue={defaultValue}
        id={id}
        name={name ?? id}
        onChange={onChange}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// --- Résumé des erreurs (error summary) ---------------------------------------

export function ResumeErreurs({ erreurs, titre = 'Il y a un problème' }: { erreurs: string[]; titre?: string }) {
  if (erreurs.length === 0) return null

  return (
    <div
      aria-labelledby="resume-erreurs-titre"
      aria-modal="false"
      className="govfr-error-summary"
      role="alert"
      tabIndex={-1}
    >
      <h2 id="resume-erreurs-titre">{titre}</h2>
      <ul>
        {erreurs.map((erreur) => (
          <li key={erreur}>{erreur}</li>
        ))}
      </ul>
    </div>
  )
}

// --- Bandeau de notification (notification banner / success) -------------------

export function BandeauNotification({ titre, type = 'succes' }: { titre: string; type?: 'succes' | 'info' }) {
  return (
    <div
      className={`govfr-banner${type === 'succes' ? ' govfr-banner--succes' : ''}`}
      role={type === 'succes' ? 'status' : 'region'}
    >
      <strong>{titre}</strong>
    </div>
  )
}

// --- Bouton principal ---------------------------------------------------------

export function BoutonPrincipal({
  children,
  disabled,
  onClick,
  type = 'button',
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button className="govfr-bouton" disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  )
}