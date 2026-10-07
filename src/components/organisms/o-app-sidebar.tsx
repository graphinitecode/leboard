'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Icon } from '@/components/atoms/a-icon'
import { initials, type AccountInfo } from '@/components/molecules/m-account-menu'
import { logout } from '@/components/molecules/m-logout'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'
import { isNavLinkActive, type AppNavItem } from '@/utilities/portalNav'

// Organism : navigation principale du shell d'appli (≥ 48rem), colonne fixe
// à gauche. Logo, sections du portail (icône monochrome + libellé en
// capitales), puis Profil, bascule de thème et déconnexion. Entre 48 et 64rem
// la colonne est compacte : libellés masqués visuellement mais conservés pour
// l'accessibilité, title en infobulle.
export function AppSidebar({
  homeHref,
  items,
  account,
}: {
  homeHref: string
  items: AppNavItem[]
  account: AccountInfo
}) {
  const pathname = usePathname() ?? ''
  const profileActive = pathname === account.profileHref

  return (
    <nav aria-label="Navigation principale" className="lpv-o-app-sidebar">
      <Link className="lpv-o-app-sidebar__logo" href={homeHref}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" height={36} src="/lpv-logo.svg" width={50} />
        <span className="lpv-o-app-sidebar__brand">LPV Board</span>
        <span className="lpv-visually-hidden">— accueil</span>
      </Link>

      <ul className="lpv-o-app-sidebar__list">
        {items.map((item) => {
          const active = isNavLinkActive(item, pathname, homeHref)
          return (
            <li key={item.href}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={`lpv-o-app-sidebar__link${active ? ' lpv-o-app-sidebar__link--active' : ''}`}
                href={item.href}
                title={item.label}
              >
                <Icon className="lpv-o-app-sidebar__icon" icon={item.icon} size={28} />
                <span className="lpv-o-app-sidebar__label">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <ul className="lpv-o-app-sidebar__list lpv-o-app-sidebar__list--bottom">
        <li>
          <Link
            aria-current={profileActive ? 'page' : undefined}
            className={`lpv-o-app-sidebar__link${profileActive ? ' lpv-o-app-sidebar__link--active' : ''}`}
            href={account.profileHref}
            title={`Profil — ${account.nom}`}
          >
            <span aria-hidden="true" className="lpv-avatar lpv-o-app-sidebar__avatar">
              {initials(account.nom)}
            </span>
            <span className="lpv-o-app-sidebar__label">Profil</span>
          </Link>
        </li>
        <li className="lpv-o-app-sidebar__theme">
          <ThemeToggle />
        </li>
        <li>
          <form action={logout}>
            <input name="redirectTo" type="hidden" value={account.logoutRedirect} />
            <button className="lpv-o-app-sidebar__link" title="Se déconnecter" type="submit">
              <Icon className="lpv-o-app-sidebar__icon" icon="boxicons:power" size={28} />
              <span className="lpv-o-app-sidebar__label">Se déconnecter</span>
            </button>
          </form>
        </li>
      </ul>
    </nav>
  )
}
