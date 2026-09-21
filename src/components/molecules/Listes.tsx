import Link from 'next/link'
import type { MouseEventHandler, ReactNode } from 'react'

// Types d'action de summary list : normal (bleu), warning (orange),
// danger (rouge, réservé au destructif). La couleur est portée par la
// classe lpv-action--{type} (cf. _listes.scss / _dark.scss).
export type ActionSummaryListType = 'normal' | 'warning' | 'danger'

// Action déclarative d'une row de summary list : lien (href) ou bouton (onClick).
// `confirmation` : libellé de la fenêtre de confirmation (action destructive).
export type ActionSummaryList = {
  type?: ActionSummaryListType
  texte: string
  key?: string
  href?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  confirmation?: string
  disabled?: boolean
}

function classeAction(type: ActionSummaryListType | undefined): string {
  return type && type !== 'normal' ? `lpv-action--${type}` : 'lpv-action--normal'
}

// Rend une ActionSummaryList : <a> si href, sinon <button>.
export function ActionSummaryListElement({ action }: { action: ActionSummaryList }) {
  const propsCommunes = {
    className: classeAction(action.type),
    'aria-label': action.confirmation ? `${action.texte} : ${action.confirmation}` : undefined,
    children: action.texte,
  }

  if (action.href && !action.disabled) {
    return <a href={action.href} onClick={action.onClick} {...propsCommunes} />
  }

  return (
    <button
      disabled={action.disabled}
      onClick={action.onClick as MouseEventHandler<HTMLButtonElement>}
      type="button"
      {...propsCommunes}
    />
  )
}

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
// Les actions sont déclaratives (ActionSummaryList) ou JSX libre (ReactNode).
// Les rows sans action portent le modifier --no-actions (bordures correctes).
// `cleNouvelle` : clé de la row à mettre en évidence à l'apparition (animation).
export function SummaryList({
  items,
  cleNouvelle,
}: {
  items: {
    cle: string
    valeur: ReactNode
    actions?: (ActionSummaryList | ReactNode)[]
  }[]
  cleNouvelle?: string
}) {
  if (items.length === 0) return null

  return (
    <dl className="lpv-summary-list">
      {items.map((item, index) => {
        const avecActions = Array.isArray(item.actions) && item.actions.length > 0
        const estNouvelle = cleNouvelle !== undefined && item.cle === cleNouvelle
        const classeRow = `lpv-summary-list__row${avecActions ? '' : ' lpv-summary-list__row--no-actions'}${estNouvelle ? ' lpv-table__nouvelle' : ''}`

        return (
          <div className={classeRow} key={`${item.cle}-${index}`}>
            <dt className="lpv-summary-list__key">{item.cle}</dt>
            <dd className="lpv-summary-list__value" style={{ margin: 0 }}>
              {item.valeur}
            </dd>
            {avecActions && (
              <dd className="lpv-summary-list__actions" style={{ margin: 0 }}>
                <ul className="lpv-summary-list__actions-list">
                  {item.actions!.map((action, indexAction) => {
                    const estDeclaratif = typeof action === 'object' && action !== null && 'texte' in action

                    return (
                      <li
                        className="lpv-summary-list__actions-list-item"
                        key={estDeclaratif && (action as ActionSummaryList).key ? (action as ActionSummaryList).key : indexAction}
                      >
                        {estDeclaratif ? <ActionSummaryListElement action={action as ActionSummaryList} /> : action}
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