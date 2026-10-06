'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'
import { useCloseOnClickOutside } from '@/hooks/useCloseOnClickOutside'

import { logout } from './m-logout'
import { isNavLinkActive, type PortalNavLink } from './m-portal-nav'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const result = parts.map((m) => m.charAt(0)).slice(0, 2)
  return result.join('').toUpperCase()
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name
}

// Molécule : menu du compte de l'entête portail (connecté uniquement), seul
// menu de l'entête. Trigger : prénom + cercle d'initiales + chevron (icône
// menu en mobile). Panneau : identité, navigation du portail (mobile
// uniquement, les onglets la portent en desktop), profil, thème, déconnexion.
export function Avatar({
  nom,
  email,
  homeHref = '/',
  navLinks = [],
  profileHref,
  logoutRedirect,
}: {
  nom: string
  email: string
  homeHref?: string
  navLinks?: PortalNavLink[]
  profileHref?: string
  logoutRedirect?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname() ?? ''

  // Ferme au clic extérieur ou à Escape
  useCloseOnClickOutside(ref, () => setOpen(false))

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="lpv-m-avatar-header">
      <button
        aria-expanded={open}
        aria-label={`Connecté en tant que ${nom}. Ouvrir le menu`}
        className="lpv-m-avatar-header__button"
        onClick={() => setOpen(!open)}
        title={`Connecté en tant que ${nom}`}
        type="button"
      >
        <span className="lpv-m-avatar-header__name">{firstName(nom)}</span>
        <span aria-hidden="true" className="lpv-avatar">
          {initials(nom)}
        </span>
        <span aria-hidden="true" className="lpv-m-avatar-header__chevron">
          <Icon icon={open ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={18} />
        </span>
        {navLinks.length > 0 && (
          <span aria-hidden="true" className="lpv-m-avatar-header__menu-icon">
            <Icon icon={open ? 'rivet-icons:close' : 'rivet-icons:menu'} size={22} />
          </span>
        )}
      </button>

      {open && (
        <div className="lpv-m-avatar-panel">
          <div className="lpv-m-avatar-panel__identity">
            <p className="lpv-m-avatar-panel__name">{nom}</p>
            <p className="lpv-m-avatar-panel__email">{email}</p>
          </div>

          {navLinks.length > 0 && (
            <nav aria-label="Navigation du portail" className="lpv-m-avatar-panel__nav">
              <ul className="lpv-m-avatar-panel__list">
                {navLinks.map((link) => {
                  const active = isNavLinkActive(link, pathname, homeHref)
                  return (
                    <li key={link.href}>
                      <Link aria-current={active ? 'page' : undefined} href={link.href} onClick={close}>
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          )}

          <ul className="lpv-m-avatar-panel__list">
            {profileHref && (
              <li>
                <Link href={profileHref} onClick={close}>
                  <Icon icon="boxicons:user" size={18} /> Mon profil
                </Link>
              </li>
            )}
            <li className="lpv-m-avatar-panel__theme">
              <ThemeToggle variant="panel" />
            </li>
            <li>
              <form action={logout}>
                {logoutRedirect && <input name="redirectTo" type="hidden" value={logoutRedirect} />}
                <button type="submit">
                  <Icon icon="boxicons:power" size={18} /> Se déconnecter
                </button>
              </form>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
