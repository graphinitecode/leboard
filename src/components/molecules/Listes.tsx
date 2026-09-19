import Link from 'next/link'
import type { ReactNode } from 'react'

// Molécule : ligne de liste réutilisable (date/titre à gauche, tag ou action à droite).
// Rend un <Link> si href fourni, sinon un <div>.
export function LigneListe({
  href,
  titre,
  sousTitre,
  action,
}: {
  href?: string
  titre: string
  sousTitre?: string
  action?: ReactNode
}) {
  const contenu = (
    <>
      <span>
        <span className="lpv-ligne__titre">{titre}</span>
        {sousTitre ? (
          <>
            {' '}
            <span style={{ color: 'var(--lpv-text-muted)' }}>· {sousTitre}</span>
          </>
        ) : null}
      </span>
      {action}
    </>
  )

  if (href) {
    return (
      <Link className="lpv-ligne" href={href}>
        {contenu}
      </Link>
    )
  }

  return <div className="lpv-ligne">{contenu}</div>
}

// Molécule : summary list (clé/valeur), style GOV.UK
export function SummaryList({
  items,
}: {
  items: { cle: string; valeur: ReactNode; action?: ReactNode }[]
}) {
  if (items.length === 0) return null

  return (
    <dl className="lpv-summary-list">
      {items.map((item, index) => (
        <div className="lpv-summary-list__row" key={`${item.cle}-${index}`}>
          <dt className="lpv-summary-list__key">{item.cle}</dt>
          <dd className="lpv-summary-list__value" style={{ margin: 0 }}>
            {item.valeur}
            {item.action ? <span style={{ marginLeft: '0.75rem' }}>{item.action}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}