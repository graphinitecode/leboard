'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type PortalNavLink = {
  href: string
  label: string
  // Préfixes supplémentaires qui rendent l'onglet actif (ex. le tableau de bord
  // reste actif sur le détail d'une séance qu'il liste)
  match?: string[]
}

// Actif par préfixe de segment (GOV.UK) : /profs/eleves est actif sur
// /profs/eleves/3. L'accueil du portail (/profs) n'est actif qu'à l'identique,
// sinon il le serait sur toutes les pages du portail.
export function isNavLinkActive(link: PortalNavLink, pathname: string, homeHref: string): boolean {
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  if (link.match?.some(matches)) return true
  return link.href === homeHref ? pathname === homeHref : matches(link.href)
}

// Molécule : navigation principale du portail, onglets horizontaux sous le
// logo (≥ 48rem). En mobile, les mêmes liens passent dans le menu du compte.
export function PortalNav({ links, homeHref }: { links: PortalNavLink[]; homeHref: string }) {
  const pathname = usePathname() ?? ''

  return (
    <nav aria-label="Navigation du portail" className="lpv-m-portal-nav">
      <ul className="lpv-m-portal-nav__list">
        {links.map((link) => {
          const active = isNavLinkActive(link, pathname, homeHref)
          return (
            <li key={link.href}>
              <Link
                aria-current={active ? 'page' : undefined}
                className={`lpv-m-portal-nav__link${active ? ' lpv-m-portal-nav__link--active' : ''}`}
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
