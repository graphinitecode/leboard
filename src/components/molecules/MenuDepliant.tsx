'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

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
  useEffect(() => {
    function horsClic(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOuvert(false)
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOuvert(false)
    }
    document.addEventListener('mousedown', horsClic)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', horsClic)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  return (
    <div ref={ref}>
      <button
        aria-expanded={ouvert}
        className="lpv-menu-bouton"
        onClick={() => setOuvert(!ouvert)}
        type="button"
      >
        <span aria-hidden="true" style={{ marginRight: '0.4rem' }}>
          {ouvert ? '▲' : '▼'}
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
                  <li key={lien.href}>
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
                  <li key={lien.href}>
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