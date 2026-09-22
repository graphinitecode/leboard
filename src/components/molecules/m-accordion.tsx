'use client'

import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'

export interface SectionAccordeon {
  titre: string
  resume?: string
  contenu: React.ReactNode
  ouvert?: boolean
}

function Heading({
  level,
  className,
  children,
}: {
  level: number
  className: string
  children: React.ReactNode
}) {
  return (
    <>
      {level === 1 && <h1 className={className}>{children}</h1>}
      {level === 2 && <h2 className={className}>{children}</h2>}
      {level === 3 && <h3 className={className}>{children}</h3>}
      {level === 4 && <h4 className={className}>{children}</h4>}
      {level === 5 && <h5 className={className}>{children}</h5>}
      {level === 6 && <h6 className={className}>{children}</h6>}
    </>
  )
}

export function Accordeon({
  id,
  sections,
  headingLevel = 2,
  souvenirOuverture = true,
  toutOuvrirTexte = 'Tout ouvrir',
  toutMasquerTexte = 'Tout masquer',
  ouvrirSectionTexte = 'Ouvrir',
  masquerSectionTexte = 'Masquer',
}: {
  id: string
  sections: SectionAccordeon[]
  headingLevel?: number
  souvenirOuverture?: boolean
  toutOuvrirTexte?: string
  toutMasquerTexte?: string
  ouvrirSectionTexte?: string
  masquerSectionTexte?: string
}) {
  const [ouverts, setOuverts] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    sections.forEach((section, i) => {
      const sectionId = `${id}-section-${i + 1}`
      init[sectionId] = section.ouvert ?? false
    })
    return init
  })
  const allOpen = Object.values(ouverts).every(Boolean) && Object.keys(ouverts).length > 0
  const ref = useRef<HTMLDivElement>(null)

  // Lecture de la mémorisation après hydratation : sessionStorage n'existe pas
  // côté serveur, le premier rendu est volontairement neutre (SSR). Disable
  // justifié : lecture d'un système externe, cas d'usage légitime de useEffect.
  useEffect(() => {
    if (!souvenirOuverture) return
    try {
      const stored = sessionStorage.getItem(`lpv-accordeon-${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, boolean>
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed && typeof parsed === 'object') setOuverts(parsed)
      }
    } catch {}
  }, [id, souvenirOuverture])

  useEffect(() => {
    if (!souvenirOuverture) return
    try {
      sessionStorage.setItem(`lpv-accordeon-${id}`, JSON.stringify(ouverts))
    } catch {}
  }, [ouverts, id, souvenirOuverture])

  function toggleSection(sectionId: string) {
    setOuverts((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  function toggleAll() {
    const newState = !allOpen
    const updated: Record<string, boolean> = {}
    Object.keys(ouverts).forEach((key) => {
      updated[key] = newState
    })
    setOuverts(updated)
  }

  return (
    <div className="lpv-accordeon" id={id} ref={ref}>
      {sections.length > 1 && (
        <button
          className="lpv-accordeon__bouton-tout"
          onClick={toggleAll}
          type="button"
        >
          {allOpen ? toutMasquerTexte : toutOuvrirTexte}
        </button>
      )}
      {sections.map((section, index) => {
        const sectionId = `${id}-section-${index + 1}`
        const isOpen = ouverts[sectionId] ?? section.ouvert ?? false
        const boutonId = `${id}-bouton-${index + 1}`
        const contenuId = `${id}-contenu-${index + 1}`

        return (
          <div className={`lpv-accordeon__section${isOpen ? ' lpv-accordeon__section--ouvert' : ''}`} key={sectionId}>
            <div className="lpv-accordeon__section-en-tete">
              <Heading className="lpv-accordeon__titre" level={headingLevel}>
                <button
                  aria-controls={contenuId}
                  aria-expanded={isOpen}
                  className="lpv-accordeon__bouton"
                  id={boutonId}
                  onClick={() => toggleSection(sectionId)}
                  type="button"
                >
                  <span aria-hidden="true" className="lpv-accordeon__icone">
                    <Icon icone={isOpen ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} taille={12} />
                  </span>
                  <span className="lpv-accordeon__texte-bouton">{section.titre}</span>
                  <span className="lpv-accordeon__texte-toggle lpv-visually-hidden">
                    {isOpen ? masquerSectionTexte : ouvrirSectionTexte}
                  </span>
                </button>
              </Heading>
              {section.resume && !isOpen ? (
                <div className="lpv-accordeon__resume">{section.resume}</div>
              ) : null}
            </div>
            <div
              aria-labelledby={boutonId}
              className={`lpv-accordeon__contenu${isOpen ? '' : ' lpv-accordeon__contenu--cache'}`}
              id={contenuId}
              role="region"
            >
              {section.contenu}
            </div>
          </div>
        )
      })}
    </div>
  )
}
