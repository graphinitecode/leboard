import { Icon } from '@/components/atoms/a-icon'
import React from 'react'

// Atome : lien de retour (flèche gauche), couleur du portail courant.
// Utilisé pour la navigation arrière (page précédente, étape précédente).
export function BackLink({
  href,
  children = 'Retour',
  onClick,
}: {
  href: string
  children?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <a
      className="lpv-a-back-link"
      href={href}
      onClick={onClick}
    >
      <span aria-hidden="true" className="lpv-a-back-link__icon">
        <Icon icon="rivet-icons:arrow-left" size={16} />
      </span>
      {children}
    </a>
  )
}
