import Link from 'next/link'

import { Avatar } from '@/components/molecules/m-avatar'

import { PortalNav, type PortalNavLink } from './m-portal-nav'

// Molécule : entête pleine largeur du portail (couleur selon data-lpv-portail).
// Ligne haute : logo (retour à l'accueil du portail) + menu du compte.
// Ligne basse (connecté, ≥ 48rem) : onglets de navigation du portail.
// Le hero est fusionné dans la même bande colorée.
// user : session serveur (getMeUserServer). Déconnecté (pages de connexion,
// RGPD) : ni navigation ni compte, le thème suit celui de la machine.
export function ServiceHeader({
  homeHref = '/',
  navLinks = [],
  heroTitle,
  heroText,
  user,
}: {
  homeHref?: string
  navLinks?: PortalNavLink[]
  heroTitle?: string
  heroText?: string
  user?: { nom: string; email: string; profileHref?: string; logoutRedirect?: string } | null
}) {
  const showNav = Boolean(user) && navLinks.length > 0

  return (
    <header className="lpv-o-header">
      <div className="lpv-o-header__inner">
        <Link className="lpv-o-header__logo" href={homeHref}>
          {/* Deux rendus du logo, la bascule est faite par CSS :
              slim (symbole seul) en mobile, large (inscription incluse) ≥ 48rem. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes — accueil"
            className="lpv-o-header__logo-slim"
            height={93}
            src="/lpv-logo-white.svg"
            width={131}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes — accueil"
            className="lpv-o-header__logo-large"
            height={93}
            src="/lpv-logo_large.png"
            width={499}
          />
        </Link>

        <div className="lpv-o-header__actions">
          {user && (
            <Avatar
              email={user.email}
              homeHref={homeHref}
              logoutRedirect={user.logoutRedirect}
              navLinks={showNav ? navLinks : []}
              nom={user.nom}
              profileHref={user.profileHref}
            />
          )}
        </div>
      </div>

      {showNav && (
        <div className="lpv-o-header__nav">
          <PortalNav homeHref={homeHref} links={navLinks} />
        </div>
      )}

      {heroTitle && (
        <div className="lpv-o-header__hero">
          <h1 className="lpv-o-header__hero-title">{heroTitle}</h1>
          {heroText ? <p className="lpv-o-header__hero-text">{heroText}</p> : null}
        </div>
      )}
    </header>
  )
}
