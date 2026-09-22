import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'warning' | 'danger' | 'success'

const CLASSES: Record<Variant, string> = {
  warning: 'lpv-a-button lpv-a-button--warning',
  danger: 'lpv-a-button lpv-a-button--danger',
  success: 'lpv-a-button lpv-a-button--success',
  primary: 'lpv-a-button',
  secondary: 'lpv-a-button lpv-a-button--secondary',
}

// Atome : bouton du design system LPV Board
export function Button({
  children,
  className,
  disabled,
  onClick,
  type = 'button',
  variant = 'primary',
  href,
  title,
}: {
  children: ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: Variant
  href?: string
  title?: string
}) {
  const classes = `${CLASSES[variant]}${className ? ` ${className}` : ''}`

  if (href) {
    return (
      <a className={classes} href={href} title={title}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled} onClick={onClick} title={title} type={type}>
      {children}
    </button>
  )
}
