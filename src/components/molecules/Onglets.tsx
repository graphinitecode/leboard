'use client'

import { useState } from 'react'

export interface Onglet {
  id: string
  libelle: string
  contenu: React.ReactNode
}

// Molécule : onglets. Inspiré de GOV.UK Tabs.
// Sans JS : tous les panneaux empilés avec liens d'ancre.
// Avec JS : tablist/tab/tabpanel, roving tabindex, flèches, état dans l'URL.
export function Onglets({
  id,
  titre = 'Contenu',
  onglets,
}: {
  id: string
  titre?: string
  onglets: Onglet[]
}) {
  const [actif, setActif] = useState(onglets[0]?.id ?? '')

  function handleKeyDown(e: React.KeyboardEvent<HTMLAnchorElement>) {
    const links = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLAnchorElement>('[role="tab"]') ?? [],
    )
    const current = links.indexOf(e.currentTarget)
    let next: number | null = null

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (current + 1) % links.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (current - 1 + links.length) % links.length
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = links.length - 1
    }

    if (next !== null) {
      e.preventDefault()
      links[next].focus()
      links[next].click()
    }
  }

  if (onglets.length === 0) return null

  return (
    <div className="lpv-onglets" id={id}>
      <h2 className="lpv-onglets__titre">{titre}</h2>
      <ul className="lpv-onglets__liste" role="tablist">
        {onglets.map((onglet) => (
          <li
            className={`lpv-onglets__item${actif === onglet.id ? ' lpv-onglets__item--selectionne' : ''}`}
            key={onglet.id}
            role="presentation"
          >
            <a
              aria-controls={`panel-${onglet.id}`}
              aria-selected={actif === onglet.id}
              className={`lpv-onglets__onglet${actif === onglet.id ? ' lpv-onglets__onglet--actif' : ''}`}
              href={`#panel-${onglet.id}`}
              id={`tab-${onglet.id}`}
              onClick={(e) => {
                e.preventDefault()
                setActif(onglet.id)
              }}
              onKeyDown={handleKeyDown}
              role="tab"
              tabIndex={actif === onglet.id ? 0 : -1}
            >
              {onglet.libelle}
            </a>
          </li>
        ))}
      </ul>
      {onglets.map((onglet) => (
        <div
          aria-labelledby={`tab-${onglet.id}`}
          className={`lpv-onglets__panneau${actif === onglet.id ? '' : ' lpv-onglets__panneau--cache'}`}
          id={`panel-${onglet.id}`}
          key={onglet.id}
          role="tabpanel"
        >
          <h3 className="lpv-onglets__panneau-titre">{onglet.libelle}</h3>
          {onglet.contenu}
        </div>
      ))}
    </div>
  )
}
