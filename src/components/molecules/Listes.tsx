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

// Molécule : summary list (clé/valeur), pattern GOV.UK.
// Chaque row : key (dt) / value (dd) / actions optionnelles (dd dédié).
// Actions multiples séparées par un trait vertical (lpv-summary-list__actions-list).
// Les rows sans action portent le modifier --no-actions (bordures correctes).
export function SummaryList({
  items,
}: {
  items: { cle: string; valeur: ReactNode; actions?: ReactNode[] }[]
}) {
  if (items.length === 0) return null

  return (
    <dl className="lpv-summary-list">
      {items.map((item, index) => {
        const avecActions = Array.isArray(item.actions) && item.actions.length > 0
        const classeRow = `lpv-summary-list__row${avecActions ? '' : ' lpv-summary-list__row--no-actions'}`

        return (
          <div className={classeRow} key={`${item.cle}-${index}`}>
            <dt className="lpv-summary-list__key">{item.cle}</dt>
            <dd className="lpv-summary-list__value" style={{ margin: 0 }}>
              {item.valeur}
            </dd>
            {avecActions && (
              <dd className="lpv-summary-list__actions" style={{ margin: 0 }}>
                <ul className="lpv-summary-list__actions-list">
                  {item.actions!.map((action, indexAction) => (
                    <li
                      className="lpv-summary-list__actions-list-item"
                      key={indexAction}
                    >
                      {action}
                    </li>
                  ))}
                </ul>
              </dd>
            )}
          </div>
        )
      })}
    </dl>
  )
}