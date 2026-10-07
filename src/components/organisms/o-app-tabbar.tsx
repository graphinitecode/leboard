'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { AccountMenu, type AccountInfo } from '@/components/molecules/m-account-menu'
import { Modal } from '@/components/molecules/m-modal'
import { isNavLinkActive, type AppNavItem } from '@/utilities/portalNav'

// Au plus 5 emplacements : 4 sections + « Plus ». Les sections au-delà
// passent en tête de la feuille « Plus ».
const MAX_TABS = 4

// Organism : barre d'onglets fixe en bas de l'écran (< 48rem), pendant mobile
// de la sidebar. « Plus » ouvre une feuille : sections restantes puis menu du
// compte (profil, thème, déconnexion).
export function AppTabbar({
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
  const buttonRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  const tabs = items.slice(0, MAX_TABS)
  const overflow = items.slice(MAX_TABS)
  const overflowActive = overflow.some((item) => isNavLinkActive(item, pathname, homeHref))

  return (
    <nav aria-label="Navigation principale" className="lpv-o-app-tabbar">
      <ul className="lpv-o-app-tabbar__list">
        {tabs.map((item) => {
          const active = isNavLinkActive(item, pathname, homeHref)
          return (
            <li key={item.href}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={`lpv-o-app-tabbar__tab${active ? ' lpv-o-app-tabbar__tab--active' : ''}`}
                href={item.href}
              >
                <span className={`lpv-o-app-tabbar__icon lpv-o-app-sidebar__icon--${item.color}`}>
                  <Icon icon={item.icon} size={26} />
                </span>
                <span className="lpv-o-app-tabbar__label">{item.shortLabel ?? item.label}</span>
              </Link>
            </li>
          )
        })}
        <li>
          <button
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`lpv-o-app-tabbar__tab${overflowActive ? ' lpv-o-app-tabbar__tab--active' : ''}`}
            onClick={() => setOpen(true)}
            ref={buttonRef}
            type="button"
          >
            <span className="lpv-o-app-tabbar__icon lpv-o-app-sidebar__icon--violet">
              <Icon icon="boxicons:dots-horizontal-rounded-circle-filled" size={26} />
            </span>
            <span className="lpv-o-app-tabbar__label">Plus</span>
          </button>
        </li>
      </ul>

      {open && (
        <Modal onClose={close} title="Plus" variant="sheet">
          {overflow.length > 0 && (
            <ul className="lpv-m-account-menu__list lpv-o-app-tabbar__overflow">
              {overflow.map((item) => {
                const active = isNavLinkActive(item, pathname, homeHref)
                return (
                  <li key={item.href}>
                    <Link aria-current={active ? 'page' : undefined} href={item.href} onClick={close}>
                      <span className={`lpv-o-app-sidebar__icon--${item.color}`}>
                        <Icon icon={item.icon} size={20} />
                      </span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <AccountMenu account={account} onNavigate={close} />
        </Modal>
      )}
    </nav>
  )
}
