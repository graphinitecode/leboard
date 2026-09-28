import Link from 'next/link'

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
          <h1 className="lpv-o-header__hero-title">{heroTitle}</h1>
          {heroText ? <p className="lpv-o-header__hero-text">{heroText}</p> : null}
        </div>
      )}
    </header>
  )
}
