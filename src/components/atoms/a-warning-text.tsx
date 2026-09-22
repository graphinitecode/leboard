import type { ReactNode } from 'react'

import { Icon } from '@/components/atoms/a-icon'

// Atome : texte d'avertissement (icône « ! » + texte gras).
// Inspiré de GOV.UK Warning text. L'icône est décorative (aria-hidden),
// le texte caché « Avertissement » est annoncé aux lecteurs d'écran.
export function WarningText({
  children,
  hiddenLabel = 'Avertissement',
}: {
  children: ReactNode
  hiddenLabel?: string
}) {
  return (
    <div className="lpv-a-warning-text">
      <Icon
        className="lpv-a-warning-text__icon-svg"
        icon="rivet-icons:exclamation-mark-circle-solid"
        size={32}
      />
      <p className="lpv-a-warning-text__text">
        <span className="lpv-visually-hidden">{hiddenLabel} : </span>
        {children}
      </p>
    </div>
  )
}
