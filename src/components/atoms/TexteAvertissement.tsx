import type { ReactNode } from 'react'

// Atome : texte d'avertissement (icône « ! » + texte gras).
// Inspiré de GOV.UK Warning text. L'icône est décorative (aria-hidden),
// le texte caché « Avertissement » est annoncé aux lecteurs d'écran.
export function TexteAvertissement({
  children,
  libelleCache = 'Avertissement',
}: {
  children: ReactNode
  libelleCache?: string
}) {
  return (
    <div className="lpv-avertissement">
      <span aria-hidden="true" className="lpv-avertissement__icone">!</span>
      <strong className="lpv-avertissement__texte">
        <span className="lpv-visually-hidden">{libelleCache} : </span>
        {children}
      </strong>
    </div>
  )
}