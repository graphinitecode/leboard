'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { AccountMenu, initials, type AccountInfo } from '@/components/molecules/m-account-menu'
import { useCloseOnClickOutside } from '@/hooks/useCloseOnClickOutside'
import { isNavLinkActive, type AppNavItem } from '@/utilities/portalNav'

// Organism : navigation principale du shell d'appli (≥ 48rem), colonne fixe
// à gauche. Logo, sections du portail (icône + libellé en capitales), puis
// Profil et « Plus » (menu du compte en popover). Entre 48 et 64rem la colonne
// est compacte : libellés masqués visuellement mais conservés pour l'accessibilité.
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
  const [open, setOpen] = useState(false)
  const moreRef = useRef<HTMLLIElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermeture (Échap, clic extérieur, lien suivi) : si le focus était dans le
  // popover, il revient au bouton « Plus » plutôt que de se perdre.
  const close = useCallback(() => {
    if (moreRef.current?.contains(document.activeElement)) buttonRef.current?.focus()
    setOpen(false)
  }, [])

  useCloseOnClickOutside(moreRef, close)

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
                <span className={`lpv-o-app-sidebar__icon lpv-o-app-sidebar__icon--${item.color}`}>
                  <Icon icon={item.icon} size={28} />
                </span>
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
            title="Profil"
          >
            <span aria-hidden="true" className="lpv-avatar lpv-o-app-sidebar__avatar">
              {initials(account.nom)}
            </span>
            <span className="lpv-o-app-sidebar__label">Profil</span>
          </Link>
        </li>
        <li className="lpv-o-app-sidebar__more" ref={moreRef}>
          <button
            aria-expanded={open}
            className="lpv-o-app-sidebar__link"
            onClick={() => setOpen(!open)}
            ref={buttonRef}
            title="Plus"
            type="button"
          >
            <span className="lpv-o-app-sidebar__icon lpv-o-app-sidebar__icon--violet">
              <Icon icon="boxicons:dots-horizontal-rounded-circle-filled" size={28} />
            </span>
            <span className="lpv-o-app-sidebar__label">Plus</span>
          </button>
          {open && (
            <div className="lpv-o-app-sidebar__popover">
              <AccountMenu account={account} onNavigate={close} />
            </div>
          )}
        </li>
      </ul>
    </nav>
  )
}
