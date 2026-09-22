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
      className="lpv-back-link"
      href={href}
      onClick={onClick}
    >
      <span aria-hidden="true" className="lpv-back-link__icone">
        <Icon icone="rivet-icons:arrow-left" taille={16} />
      </span>
      {children}
    </a>
  )
}
