'use client'

import { useEffect, useRef } from 'react'

function LienErreur({ champId, texte }: { champId: string; texte: string }) {
  return (
    <a
      href={`#${champId}`}
      onClick={(e) => {
        e.preventDefault()
        document.getElementById(champId)?.focus()
      }}
    >
      {texte}
    </a>
  )
}

// Molécule : résumé des erreurs en tête de formulaire (role alert).
// Convention GOV.UK : chaque item est un lien vers le champ en erreur
// (id optionnel) ; le summary prend le focus quand il APPARAIT, pas aux
// re-renders suivants — sinon il vole le focus du champ à chaque frappe.
export function ResumeErreurs({
  erreurs,
  titre = 'Il y a ' + erreurs.length + ' problème' + (erreurs.length > 1 ? 's' : ''),
}: {
  erreurs: (string | { champId: string; texte: string })[]
  titre?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const items: { champId?: string; texte: string }[] = erreurs.map((erreur) =>
    typeof erreur === 'string' ? { texte: erreur } : erreur,
  )

  // Prend le focus uniquement à l'apparition (transition vide -> non-vide)
  const avaitErreurs = useRef(false)
  useEffect(() => {
    if (items.length > 0 && !avaitErreurs.current) {
      ref.current?.focus()
    }
    avaitErreurs.current = items.length > 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erreurs])

  if (items.length === 0) return null

  return (
    <div aria-labelledby="resume-erreurs-titre" className="lpv-error-summary" ref={ref} role="alert" tabIndex={-1}>
      <h2 id="resume-erreurs-titre">{titre}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.texte}>
            {item.champId ? (
              <LienErreur champId={item.champId} texte={item.texte} />
            ) : (
              item.texte
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Molécule : bandeau de notification (succès / info)
export function NotificationBanner({ titre, type = 'success' }: { titre: string; type?: 'success' | 'info' }) {
  return (
    <div
      className={`lpv-banner${type === 'success' ? ' lpv-banner--success' : ''}`}
      role={type === 'success' ? 'status' : 'region'}
    >
      <strong>{titre}</strong>
    </div>
  )
}
