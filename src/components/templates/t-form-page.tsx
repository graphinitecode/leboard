import type { ReactNode } from 'react'

import { BackLink } from '@/components/atoms/a-back-link'

// Template : page formulaire centré (connexion, mot de passe…) — conteneur
// lpv-login, lien retour optionnel, titre, sous-titre optionnel, puis le
// formulaire en slot children (l'organism ne porte ni conteneur ni titre).
export function FormPage({
  title,
  subtitle,
  retour,
  children,
}: {
  title: string
  subtitle?: string
  retour?: { href: string; label: string }
  children: ReactNode
}) {
  return (
    <div className="lpv-t-form-page lpv-login">
      {retour ? <BackLink href={retour.href}>{retour.label}</BackLink> : null}
      <h1 className="lpv-login__title">{title}</h1>
      {subtitle ? <p className="lpv-login__subtitle">{subtitle}</p> : null}
      {children}
    </div>
  )
}
