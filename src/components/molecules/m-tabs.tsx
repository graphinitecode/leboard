'use client'

import { useState } from 'react'

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

// Molécule : onglets. Inspiré de GOV.UK Tabs.
// Sans JS : tous les panneaux empilés avec liens d'ancre.
// Avec JS : tablist/tab/tabpanel, roving tabindex, flèches, état dans l'URL.
export function Tabs({
  id,
  title = 'Contenu',
  tabs,
}: {
  id: string
  title?: string
  tabs: Tab[]
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')

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

  if (tabs.length === 0) return null

  return (
    <div className="lpv-m-tabs" id={id}>
      <h2 className="lpv-m-tabs__titre">{title}</h2>
      <ul className="lpv-m-tabs__liste" role="tablist">
        {tabs.map((tab) => (
          <li
            className={`lpv-m-tabs__item${active === tab.id ? ' lpv-m-tabs__item--selectionne' : ''}`}
            key={tab.id}
            role="presentation"
          >
            <a
              aria-controls={`panel-${tab.id}`}
              aria-selected={active === tab.id}
              className={`lpv-m-tabs__tab${active === tab.id ? ' lpv-m-tabs__tab--active' : ''}`}
              href={`#panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={(e) => {
                e.preventDefault()
                setActive(tab.id)
              }}
              onKeyDown={handleKeyDown}
              role="tab"
              tabIndex={active === tab.id ? 0 : -1}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
      {tabs.map((tab) => (
        <div
          aria-labelledby={`tab-${tab.id}`}
          className={`lpv-m-tabs__panneau${active === tab.id ? '' : ' lpv-m-tabs__panneau--cache'}`}
          id={`panel-${tab.id}`}
          key={tab.id}
          role="tabpanel"
        >
          <h3 className="lpv-m-tabs__panneau-titre">{tab.label}</h3>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
