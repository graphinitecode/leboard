'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'
import { useCloseOnClickOutside } from '@/hooks/useCloseOnClickOutside'

type MenuSection = 'services' | 'legal'

type MenuLink = { href: string; label: string; description?: string }

// Molécule : menu dépliant de l'entête portail (bouton Menu façon GOV.UK).
// Desktop/tablette : bouton texte + chevron, panneau pleine largeur 2 colonnes.
// Mobile : icône rivet-icons:menu qui devient close panneau ouvert, sections
// en accordéon vertical (titres cliquables, liens dépliables dessous).
// La bascule de thème vit dans le panneau (ligne dédiée), plus dans la barre.
export function CollapsibleMenu({
  services,
  legalLinks,
}: {
  services: MenuLink[]
  legalLinks: MenuLink[]
}) {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Set<MenuSection>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  // Ferme au clic extérieur ou à Escape
  useCloseOnClickOutside(ref, () => setOpen(false))

  function toggleSection(section: MenuSection) {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  function column(section: MenuSection, title: string, links: MenuLink[]) {
    const isOpen = openSections.has(section)

    return (
      <div className={`lpv-m-collapsible-menu__column${isOpen ? ' lpv-m-collapsible-menu__column--open' : ''}`}>
        <button
          aria-expanded={isOpen}
          className="lpv-m-collapsible-menu__column-title"
          onClick={() => toggleSection(section)}
          type="button"
        >
          {title}
          <span aria-hidden="true" className="lpv-m-collapsible-menu__column-chevron">
            <Icon icon={isOpen ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={20} />
          </span>
        </button>
        <ul>
          {links.map((link) => (
            <li key={`${link.href} ${link.label}`}>
              <Link href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
              {link.description ? <p>{link.description}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <button
        aria-expanded={open}
        className="lpv-m-collapsible-menu__button"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span aria-hidden="true" className="lpv-m-collapsible-menu__button-icon">
          <Icon icon={open ? 'rivet-icons:close' : 'rivet-icons:menu'} size={22} />
        </span>
        <span aria-hidden="true" className="lpv-m-collapsible-menu__button-chevron">
          <Icon icon={open ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={22} />
        </span>
        <span className="lpv-m-collapsible-menu__button-label">Menu</span>
      </button>

      {open && (
        <div className="lpv-m-collapsible-menu">
          <div className="lpv-m-collapsible-menu__inner">
            {column('services', 'Services et informations', services)}
            {column('legal', 'Légales', legalLinks)}
          </div>
          <div className="lpv-m-collapsible-menu__footer">
            <ThemeToggle variant="panel" />
          </div>
        </div>
      )}
    </div>
  )
}
