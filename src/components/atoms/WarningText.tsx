import type { ReactNode } from 'react'

import { Icon } from '@/components/atoms/Icon'

// Atome : texte d'avertissement (icône « ! » + texte gras).
// Inspiré de GOV.UK Warning text. L'icône est décorative (aria-hidden),
// le texte caché « Avertissement » est annoncé aux lecteurs d'écran.
export function WarningText({
  children,
  libelleCache = 'Avertissement',
}: {
  children: ReactNode
  libelleCache?: string
}) {
  return (
    <div className="lpv-avertissement">
      <Icon
        classe="lpv-avertissement__icone-svg"
        icone="rivet-icons:exclamation-mark-circle-solid"
        taille={32}
      />
      <p className="lpv-avertissement__texte">
        <span className="lpv-visually-hidden">{libelleCache} : </span>
        {children}
      </p>
    </div>
  )
}
