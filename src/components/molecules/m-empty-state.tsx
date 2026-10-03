import type { ReactNode } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Icon } from '@/components/atoms/a-icon'

// Molécule : état vide « design » (EmptyState). Remplace les
// <p className="lpv-muted">Aucun…</p> éparses : un badge circulaire teinté
// (les couleurs douces des tags, comme a-icon-card — pas de bandeau de
// couleur en tête), un titre, une description et des actions.
// - variant : neutral | info | success | warning — teintes gris / bleu /
//   vert / rouge (« warning » reprend l'accent rouge de la maquette).
// - icon : nom iconify rendu par l'atome Icon, décoratif (le titre porte le
//   sens) ; absent → icône de repli selon la variante.
// - actions : sobres et peu nombreuses — un lien (href) ou un bouton
//   (onClick) ; à l'usage, les pages serveur passent des `href` (une fonction
//   ne traverse pas la frontière serveur), les vues clients peuvent passer
//   des `onClick`.
export type ActionEmptyState = {
  href?: string
  label: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'tertiary'
}

export type VarianteEmptyState = 'info' | 'neutral' | 'success' | 'warning'

const ICON_REPLI: Record<VarianteEmptyState, string> = {
  info: 'rivet-icons:info-circle',
  neutral: 'rivet-icons:info-circle',
  success: 'rivet-icons:check-circle',
  warning: 'rivet-icons:caution',
}

export function EmptyState({
  actions,
  className,
  compact = false,
  description,
  icon,
  title,
  variant = 'neutral',
}: {
  /** 1 à 2 actions : lien (href) ou bouton (onClick), variante au besoin. */
  actions?: ActionEmptyState[]
  className?: string
  /** Espacement réduit (encart de tableau, carte étroite). */
  compact?: boolean
  description?: ReactNode
  icon?: string
  title: string
  variant?: VarianteEmptyState
}) {
  const classes = [
    'lpv-m-empty-state',
    `lpv-m-empty-state--${variant}`,
    compact ? 'lpv-m-empty-state--compact' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="lpv-m-empty-state__badge">
        <Icon
          icon={icon ?? ICON_REPLI[variant]}
          size={compact ? 37 : 56}
          className="lpv-m-empty-state__badge--icon"
        />
      </div>
      <p className="lpv-m-empty-state__title">{title}</p>
      {description ? <p className="lpv-m-empty-state__description">{description}</p> : null}
      {actions && actions.length > 0 ? (
        <div className="lpv-m-empty-state__actions">
          {actions.map((action, index) => (
            <Button
              href={action.href}
              key={`${action.label}-${index}`}
              onClick={action.onClick}
              variant={action.variant ?? 'primary'}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
