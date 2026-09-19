import type { ReactNode } from 'react'

type Variante = 'primaire' | 'secondaire'

// Atome : bouton du design system LPV Board
export function Bouton({
  children,
  disabled,
  onClick,
  type = 'button',
  variante = 'primaire',
  href,
  titre,
}: {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  variante?: 'primaire' | 'secondaire'
  href?: string
  titre?: string
}) {
  const classe = `lpv-bouton${variante === 'secondaire' ? ' lpv-bouton--secondaire' : ''}`

  if (href) {
    return (
      <a className={classe} href={href} title={titre}>
        {children}
      </a>
    )
  }

  return (
    <button className={classe} disabled={disabled} onClick={onClick} title={titre} type={type}>
      {children}
    </button>
  )
}