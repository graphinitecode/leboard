'use client'

import { useEffect, useRef } from 'react'

function ErrorLink({ fieldId, text }: { fieldId: string; text: string }) {
  return (
    <a
      href={`#${fieldId}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(fieldId)?.focus()
      }}
    >
      {text}
    </a>
  )
}

// Molécule : résumé des erreurs en tête de formulaire (role alert).
// Convention GOV.UK : chaque item est un lien vers le champ en erreur
// (id optionnel) ; le summary prend le focus quand il APPARAIT, pas aux
// re-renders suivants — sinon il vole le focus du champ à chaque frappe.
export function ErrorSummary({
  errors,
  title = 'Il y a ' + errors.length + ' problème' + (errors.length > 1 ? 's' : ''),
}: {
  errors: (string | { fieldId: string; text: string })[]
  title?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const items: { fieldId?: string; text: string }[] = errors.map((erreur) =>
    typeof erreur === 'string' ? { text: erreur } : erreur,
  )

  // Prend le focus uniquement à l'apparition (transition vide -> non-vide)
  const hadErrors = useRef(false)
  useEffect(() => {
    if (items.length > 0 && !hadErrors.current) {
      ref.current?.focus()
    }
    hadErrors.current = items.length > 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors])

  if (items.length === 0) return null

  return (
    <div aria-labelledby="error-summary-title" className="lpv-m-error-summary" ref={ref} role="alert" tabIndex={-1}>
      <h2 id="error-summary-title">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.text}>
            {item.fieldId ? (
              <ErrorLink fieldId={item.fieldId} text={item.text} />
            ) : (
              item.text
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Molécule : bandeau de notification (succès / info)
export function NotificationBanner({ title, type = 'success' }: { title: string; type?: 'success' | 'info' }) {
  return (
    <div
      className={`lpv-banner${type === 'success' ? ' lpv-banner--success' : ''}`}
      role={type === 'success' ? 'status' : 'region'}
    >
      <strong>{title}</strong>
    </div>
  )
}
