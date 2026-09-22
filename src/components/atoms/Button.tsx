import type { ReactNode } from 'react'

type Variante = 'primaire' | 'secondaire' | 'avertissement' | 'danger'

const CLASSES: Record<Variante, string> = {
  avertissement: 'lpv-bouton lpv-bouton--avertissement',
  danger: 'lpv-bouton lpv-bouton--danger',
  primaire: 'lpv-bouton',
  secondaire: 'lpv-bouton lpv-bouton--secondaire',
}

// Atome : bouton du design system LPV Board
export function Button({
  children,
  className,
  disabled,
  onClick,
  type = 'button',
  variante = 'primaire',
  href,
  titre,
}: {
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  variante?: Variante
  href?: string
  titre?: string
}) {
  const classe = `${CLASSES[variante]}${className ? ` ${className}` : ''}`

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
