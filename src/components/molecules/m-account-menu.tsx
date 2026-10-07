'use client'

import Link from 'next/link'

import { Icon } from '@/components/atoms/a-icon'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'

import type { AccountInfo } from '@/utilities/portalNav'

import { logout } from './m-logout'

export type { AccountInfo }

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Molécule : contenu du menu « Plus » du shell d'appli (popover de la sidebar,
// feuille de la barre d'onglets mobile). Identité, profil, thème, retour au
// site, déconnexion. onNavigate referme le conteneur après un clic sur un lien.
export function AccountMenu({ account, onNavigate }: { account: AccountInfo; onNavigate?: () => void }) {
  return (
    <div className="lpv-m-account-menu">
      <div className="lpv-m-account-menu__identity">
        <p className="lpv-m-account-menu__name">{account.nom}</p>
        <p className="lpv-m-account-menu__email">{account.email}</p>
      </div>

      <ul className="lpv-m-account-menu__list">
        <li>
          <Link href={account.profileHref} onClick={onNavigate}>
            <Icon icon="boxicons:user" size={18} /> Mon profil
          </Link>
        </li>
        <li className="lpv-m-account-menu__theme">
          <ThemeToggle variant="panel" />
        </li>
        <li>
          <Link href="/" onClick={onNavigate}>
            <Icon icon="boxicons:home" size={18} /> Site de l&rsquo;association
          </Link>
        </li>
        <li>
          <form action={logout}>
            <input name="redirectTo" type="hidden" value={account.logoutRedirect} />
            <button type="submit">
              <Icon icon="boxicons:power" size={18} /> Se déconnecter
            </button>
          </form>
        </li>
      </ul>
    </div>
  )
}
