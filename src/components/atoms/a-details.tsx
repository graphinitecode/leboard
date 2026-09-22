import type { ReactNode } from 'react'

import { Icon } from '@/components/atoms/a-icon'

// Atome : détails dépliables (<details>/<summary>).
// Inspiré de GOV.UK Details. Utilise l'élément HTML natif, pas de JS requis.
// Utiliser pour du contenu secondaire que seul certains utilisateurs ont besoin de voir.
// Ne pas utiliser pour cacher du contenu dont la majorité des utilisateurs a besoin.
export function Details({
  summary,
  open = false,
  children,
  id,
}: {
  summary: string
  open?: boolean
  children: ReactNode
  id?: string
}) {
  return (
    <details className="lpv-a-details" id={id} open={open}>
      <summary className="lpv-a-details__summary">
        <span aria-hidden="true" className="lpv-a-details__chevron lpv-a-details__chevron--closed">
          <Icon icon="rivet-icons:chevron-down" size={22} />
        </span>
        <span aria-hidden="true" className="lpv-a-details__chevron lpv-a-details__chevron--open">
          <Icon icon="rivet-icons:chevron-up" size={22} />
        </span>
        <span className="lpv-a-details__summary-text">{summary}</span>
      </summary>
      <div className="lpv-a-details__text">{children}</div>
    </details>
  )
}