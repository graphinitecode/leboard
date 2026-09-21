'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'

import { Icon } from '@/components/atoms/Icon'
import { useFermerHorsClic } from '@/hooks/useFermerHorsClic'

// Molécule : menu dépliant façon GOV.UK (bouton Menu dans l'entête bleue).
// Sections : Services et informations / Légales.
export function MenuDepliant({
  services,
  legales,
}: {
  services: { href: string; libelle: string; description?: string }[]
  legales: { href: string; libelle: string; description?: string }[]
}) {
  const [ouvert, setOuvert] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Ferme au clic extérieur ou à Escape
  useFermerHorsClic(ref, () => setOuvert(false))

  return (
    <div ref={ref}>
      <button
        aria-expanded={ouvert}
        className="lpv-menu-bouton"
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        <span aria-hidden="true" className="lpv-menu-bouton__chevron">
          <Icon icone={ouvert ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={22} />
        </span>
        Menu
      </button>

      {ouvert && (
        <div className="lpv-menu-panneau">
          <div className="lpv-menu-panneau__inner">
            <div className="lpv-menu-panneau__colonne">
              <h2 className="lpv-menu-panneau__titre">Services et informations</h2>
              <ul>
                {services.map((lien) => (
                  <li key={`${lien.href} ${lien.libelle}`}>
                    <Link href={lien.href} onClick={() => setOuvert(false)}>
                      {lien.libelle}
                    </Link>
                    {lien.description ? <p>{lien.description}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lpv-menu-panneau__colonne">
              <h2 className="lpv-menu-panneau__titre">Légales</h2>
              <ul>
                {legales.map((lien) => (
                  <li key={`${lien.href} ${lien.libelle}`}>
                    <Link href={lien.href} onClick={() => setOuvert(false)}>
                      {lien.libelle}
                    </Link>
                    {lien.description ? <p>{lien.description}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}