'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { Icon } from '@/components/atoms/Icon'
import { useFermerHorsClic } from '@/hooks/useFermerHorsClic'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  // État actif par préfixe de segment (GOV.UK) : /profs est actif sur /profs/eleves/3
  function estActif(href: string | undefined): boolean {
    if (!href) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav aria-label="Navigation principale" className="lpv-entete-nav">
      {navItems.map((item, i) => {
        if (item.typeItem === 'dropdown' && item.dropdown?.label) {
          return (
            <DropdownNav
              key={i}
              label={item.dropdown.label}
              sousLiens={(item.dropdown.sousLiens ?? []).map(({ link }) => link)}
            />
          )
        }

        const { type, url, reference, label, newTab } = item.link ?? {}
        const href =
          type === 'reference' && typeof reference?.value === 'object' && 'slug' in reference.value
            ? `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
            : url

        if (!href) return null

        return (
          <Link
            aria-current={estActif(href) ? 'page' : undefined}
            className={`lpv-entete-nav__lien${estActif(href) ? ' lpv-entete-nav__lien--actif' : ''}`}
            href={href}
            key={i}
            {...(newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {label}
          </Link>
        )
      })}
      {data?.afficherRecherche !== false && (
        <Link aria-label="Recherche" className="lpv-entete-nav__recherche" href="/search">
          <Icon icone="rivet-icons:magnifying-glass" taille={20} />
          <span className="lpv-visually-hidden">Recherche</span>
        </Link>
      )}
    </nav>
  )
}

// Item de nav avec menu déroulant : bouton libellé + chevron, panneau vertical
// de sous-liens, ouvert au clic, fermé à Escape / clic extérieur (hook partagé).
function DropdownNav({
  label,
  sousLiens,
}: {
  label: string
  sousLiens: NonNullable<HeaderType['navItems']>[number]['link'][]
}) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useFermerHorsClic(ref, () => setOuvert(false))

  function lienHref(
    lien: NonNullable<HeaderType['navItems']>[number]['link'],
  ): string | null {
    if (!lien) return null
    const { type, url, reference } = lien
    if (
      type === 'reference' &&
      typeof reference?.value === 'object' &&
      'slug' in reference.value
    ) {
      return `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
    }
    return url ?? null
  }

  return (
    <div className="lpv-entete-dropdown" ref={ref}>
      <button
        aria-expanded={ouvert}
        className={`lpv-entete-nav__lien lpv-entete-dropdown__bouton${ouvert ? ' lpv-entete-dropdown__bouton--ouvert' : ''}`}
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        {label}
        <span aria-hidden="true" className="lpv-entete-dropdown__chevron">
          <Icon icone={ouvert ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={22} />
        </span>
      </button>

      {ouvert && (
        <div className="lpv-entete-dropdown__panneau">
          <ul className="lpv-entete-dropdown__liste">
            {sousLiens.map((lien, i) => {
              if (!lien) return null
              const href = lienHref(lien)
              if (!href) return null
              return (
                <li key={i}>
                  <Link href={href} onClick={() => setOuvert(false)}>
                    {lien.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
