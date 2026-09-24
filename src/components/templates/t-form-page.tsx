import type { ReactNode } from 'react'

// Template : page formulaire centré (connexion…) — conteneur lpv-login,
// titre, sous-titre optionnel, puis le formulaire en slot children.
export function FormPage({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="lpv-t-form-page lpv-login">
      <h1 className="lpv-login__title">{title}</h1>
      {subtitle ? <p className="lpv-login__subtitle">{subtitle}</p> : null}
      {children}
    </div>
  )
}