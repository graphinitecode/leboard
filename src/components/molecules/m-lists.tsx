import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'

// Types d'action de summary list : normal (bleu), warning (orange),
// danger (rouge, réservé au destructif). La couleur est portée par la
// classe lpv-action--{type} (cf. _listes.scss / _dark.scss).
export type ActionSummaryListType = 'normal' | 'warning' | 'danger'

// Action déclarative d'une row de summary list : lien (href) ou bouton (onClick).
// `confirmation` : libellé de la fenêtre de confirmation (action destructive).
// `onClick` est typé HTMLElement : l'action est rendue soit en <a>, soit en <button>.
export type ActionSummaryList = {
  type?: ActionSummaryListType
  label: string
  key?: string
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  confirmation?: string
  disabled?: boolean
}

function actionClass(type: ActionSummaryListType | undefined): string {
  return type && type !== 'normal' ? `lpv-action--${type}` : 'lpv-action--normal'
}

// Rend une ActionSummaryList : <a> si href, sinon <button>.
export function ActionSummaryListElement({ action }: { action: ActionSummaryList }) {
  const commonProps = {
    className: actionClass(action.type),
    'aria-label': action.confirmation ? `${action.label} : ${action.confirmation}` : undefined,
    children: action.label,
  }

  if (action.href && !action.disabled) {
    return <a href={action.href} onClick={action.onClick} {...commonProps} />
  }

  return (
    <button
      disabled={action.disabled}
      onClick={action.onClick}
      type="button"
      {...commonProps}
    />
  )
}

// Molécule : ligne de liste réutilisable (date/titre à gauche, tag ou action à droite).
// Rend un <Link> si href fourni, sinon un <div>.
export function ListRow({
  href,
  title,
  subtitle,
  action,
}: {
  href?: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  const contenu = (
    <>
      <span>
        <span className="lpv-m-list-row__title">{title}</span>
        {subtitle ? (
          <>
            {' '}
            <span style={{ color: 'var(--lpv-text-muted)' }}>· {subtitle}</span>
          </>
        ) : null}
      </span>
      {action}
    </>
  )

  if (href) {
    return (
      <Link className="lpv-m-list-row" href={href}>
        {contenu}
      </Link>
    )
  }

  return <div className="lpv-m-list-row">{contenu}</div>
}

// Molécule : summary list (clé/valeur), pattern GOV.UK.
// Chaque row : key (dt) / value (dd) / actions optionnelles (dd dédié).
// Actions multiples séparées par un trait vertical (lpv-summary-list__actions-list).
// Les actions sont déclaratives (ActionSummaryList) ou JSX libre (ReactNode).
// Les rows sans action portent le modifier --no-actions (bordures correctes).
// `highlightKey` : clé de la row à mettre en évidence à l'apparition (animation).
export function SummaryList({
  items,
  highlightKey,
}: {
  items: {
    key: string
    value: ReactNode
    actions?: (ActionSummaryList | ReactNode)[]
  }[]
  highlightKey?: string
}) {
  if (items.length === 0) return null

  return (
    <dl className="lpv-summary-list">
      {items.map((item, index) => {
        const hasActions = Array.isArray(item.actions) && item.actions.length > 0
        const isNew = highlightKey !== undefined && item.key === highlightKey
        const rowClass = `lpv-summary-list__row${hasActions ? '' : ' lpv-summary-list__row--no-actions'}${isNew ? ' lpv-table__nouvelle' : ''}`

        return (
          <div className={rowClass} key={`${item.key}-${index}`}>
            <dt className="lpv-summary-list__key">{item.key}</dt>
            <dd className="lpv-summary-list__value" style={{ margin: 0 }}>
              {item.value}
            </dd>
            {hasActions && (
              <dd className="lpv-summary-list__actions" style={{ margin: 0 }}>
                <ul className="lpv-summary-list__actions-list">
                  {item.actions!.map((action, indexAction) => {
                    const isDeclarative = typeof action === 'object' && action !== null && 'label' in action

                    return (
                      <li
                        className="lpv-summary-list__actions-list-item"
                        key={isDeclarative && (action as ActionSummaryList).key ? (action as ActionSummaryList).key : indexAction}
                      >
                        {isDeclarative ? <ActionSummaryListElement action={action as ActionSummaryList} /> : action}
                      </li>
                    )
                  })}
                </ul>
              </dd>
            )}
          </div>
        )
      })}
    </dl>
  )
}