import Link from 'next/link'
import type { ReactNode } from 'react'

import { Footer } from '@/components/molecules/m-footer'
import { Avatar } from '@/components/molecules/m-avatar'

import { CollapsibleMenu } from './m-collapsible-menu'

// Molécule : entête pleine largeur du portail (couleur selon data-lpv-portail).
// Logo blanc « Association Les Pierres Vivantes » + Menu dépliant + identité.
// Le hero est fusionné dans la même bande colorée.
// utilisateur : session serveur (getMeUserServer) — connecté : avatar dropdown
// + séparateur vertical avant le menu, sinon rien (les pages login n'affichent
// pas d'identité).
export function ServiceHeader({
  heroTitle,
  heroText,
  user,
  services,
  legalLinks,
}: {
  heroTitle?: string
  heroText?: string
  user?: { nom: string; email: string } | null
  services: { href: string; label: string; description?: string }[]
  legalLinks: { href: string; label: string; description?: string }[]
}) {
  return (
    <header className="lpv-o-header">
      <div className="lpv-o-header__inner">
        <Link className="lpv-o-header__logo" href="/">
          {/* Deux rendus du logo, la bascule est faite par CSS :
              slim (symbole seul) en mobile, large (inscription incluse) ≥ 48rem. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes"
            className="lpv-o-header__logo-slim"
            height={93}
            src="/lpv-logo-white.svg"
            width={131}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes"
            className="lpv-o-header__logo-large"
            height={93}
            src="/lpv-logo_large.png"
            width={499}
          />
        </Link>

        <div className="lpv-o-header__actions">
          {user && <Avatar email={user.email} nom={user.nom} />}
          {user && <span aria-hidden="true" className="lpv-o-header__separator" />}
          <CollapsibleMenu services={services} legalLinks={legalLinks} />
        </div>
      </div>

      {heroTitle && (
        <div className="lpv-o-header__hero">
          <h1 className="lpv-o-header__hero-titre">{heroTitle}</h1>
          {heroText ? <p className="lpv-o-header__hero-texte">{heroText}</p> : null}
        </div>
      )}
    </header>
  )
}

// Molécule : conteneur principal des pages portail (shell).
// portail: 'profs' (bleu, défaut) | 'parents' (violet) | 'eleves' (orange) —
// pilote la couleur via data-lpv-portail. Masque le chrome du site vitrine.
export function PageContent({
  children,
  header,
  footerLinks,
  portail = 'profs',
}: {
  children: ReactNode
  header?: ReactNode
  footerLinks?: { href: string; label: string }[]
  portail?: 'profs' | 'parents' | 'eleves'
}) {
  return (
    <div
      className="lpv-shell"
      data-lpv-portail={portail}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      {header}
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer links={footerLinks} />
    </div>
  )
}
