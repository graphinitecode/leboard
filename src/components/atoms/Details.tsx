import type { ReactNode } from 'react'

// Atome : détails dépliables (<details>/<summary>).
// Inspiré de GOV.UK Details. Utilise l'élément HTML natif, pas de JS requis.
// Utiliser pour du contenu secondaire que seul certains utilisateurs ont besoin de voir.
// Ne pas utiliser pour cacher du contenu dont la majorité des utilisateurs a besoin.
export function Details({
  resume,
  open = false,
  children,
  id,
}: {
  resume: string
  open?: boolean
  children: ReactNode
  id?: string
}) {
  return (
    <details className="lpv-details" id={id} open={open}>
      <summary className="lpv-details__resume">
        <span className="lpv-details__resume-texte">{resume}</span>
      </summary>
      <div className="lpv-details__texte">{children}</div>
    </details>
  )
}