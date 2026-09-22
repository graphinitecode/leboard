'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/Icon'
import { ToggleTheme } from '@/components/molecules/ToggleTheme'
import { useFermerHorsClic } from '@/hooks/useFermerHorsClic'

type Section = 'services' | 'legales'

type LienMenu = { href: string; libelle: string; description?: string }

// Molécule : menu dépliant de l'entête portail (bouton Menu façon GOV.UK).
// Desktop/tablette : bouton texte + chevron, panneau pleine largeur 2 colonnes.
// Mobile : icône rivet-icons:menu qui devient close panneau ouvert, sections
// en accordéon vertical (titres cliquables, liens dépliables dessous).
// La bascule de thème vit dans le panneau (ligne dédiée), plus dans la barre.
export function MenuDepliant({
  services,
  legales,
}: {
  services: LienMenu[]
  legales: LienMenu[]
}) {
  const [ouvert, setOuvert] = useState(false)
  const [sectionsOuvertes, setSectionsOuvertes] = useState<Set<Section>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  // Ferme au clic extérieur ou à Escape
  useFermerHorsClic(ref, () => setOuvert(false))

  function basculerSection(section: Section) {
    setSectionsOuvertes((precedent) => {
      const suivant = new Set(precedent)
      if (suivant.has(section)) {
        suivant.delete(section)
      } else {
        suivant.add(section)
      }
      return suivant
    })
  }

  function colonne(section: Section, titre: string, liens: LienMenu[]) {
    const ouverte = sectionsOuvertes.has(section)

    return (
      <div className={`lpv-menu-panneau__colonne${ouverte ? ' lpv-menu-panneau__colonne--ouverte' : ''}`}>
        <button
          aria-expanded={ouverte}
          className="lpv-menu-panneau__titre-bouton"
          onClick={() => basculerSection(section)}
          type="button"
        >
          {titre}
          <span aria-hidden="true" className="lpv-menu-panneau__titre-chevron">
            <Icon icone={ouverte ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={20} />
          </span>
        </button>
        <ul>
          {liens.map((lien) => (
            <li key={`${lien.href} ${lien.libelle}`}>
              <Link href={lien.href} onClick={() => setOuvert(false)}>
                {lien.libelle}
              </Link>
              {lien.description ? <p>{lien.description}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={ref}>
      <button
        aria-expanded={ouvert}
        className="lpv-menu-bouton"
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        <span aria-hidden="true" className="lpv-menu-bouton__icone">
          <Icon icone={ouvert ? 'rivet-icons:close' : 'rivet-icons:menu'} taille={22} />
        </span>
        <span aria-hidden="true" className="lpv-menu-bouton__chevron">
          <Icon icone={ouvert ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={22} />
        </span>
        <span className="lpv-menu-bouton__libelle">Menu</span>
      </button>

      {ouvert && (
        <div className="lpv-menu-panneau">
          <div className="lpv-menu-panneau__inner">
            {colonne('services', 'Services et informations', services)}
            {colonne('legales', 'Légales', legales)}
          </div>
          <div className="lpv-menu-panneau__pied">
            <ToggleTheme variante="panneau" />
          </div>
        </div>
      )}
    </div>
  )
}
