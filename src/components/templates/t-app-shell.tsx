import Link from 'next/link'
import type { ReactNode } from 'react'

import { AppFooter } from '@/components/molecules/m-app-footer'
import type { AccountInfo } from '@/components/molecules/m-account-menu'
import { AppSidebar } from '@/components/organisms/o-app-sidebar'
import { AppTabbar } from '@/components/organisms/o-app-tabbar'
import type { AppFooterData } from '@/utilities/appFooter'
import type { AppNavItem } from '@/utilities/portalNav'

// Template : shell d'application des portails.
// Connecté (account + items) : sidebar à gauche ≥ 48rem, barre d'onglets en
// bas < 48rem. Déconnecté (connexion, RGPD, mot de passe) : en-tête fin avec
// le logo seul. portail pilote la couleur via data-lpv-portail ; la classe
// lpv-shell masque le chrome du site vitrine. footer : données du pied de page
// minimaliste.
export function AppShell({
  children,
  footer = null,
  homeHref,
  items = [],
  account = null,
  portail = 'profs',
}: {
  children: ReactNode
  footer?: AppFooterData | null
  homeHref: string
  items?: AppNavItem[]
  account?: AccountInfo | null
  portail?: 'profs' | 'parents'
}) {
  const connected = Boolean(account) && items.length > 0

  return (
    <div
      className={`lpv-t-app-shell lpv-shell${connected ? ' lpv-t-app-shell--connected' : ''}`}
      data-lpv-portail={portail}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>

      {connected && account && <AppSidebar account={account} homeHref={homeHref} items={items} />}

      <div className="lpv-t-app-shell__body">
        <header className="lpv-t-app-shell__topbar">
          <Link className="lpv-t-app-shell__logo" href={homeHref}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" height={40} src="/lpv-logo.svg" width={56} />
            <span className="lpv-visually-hidden">LPV Board — accueil</span>
          </Link>
        </header>

        <main className="lpv-container lpv-t-app-shell__main" id="contenu-principal">
          {children}
        </main>

        {footer && <AppFooter {...footer} />}
      </div>

      {connected && account && <AppTabbar account={account} homeHref={homeHref} items={items} />}
    </div>
  )
}
