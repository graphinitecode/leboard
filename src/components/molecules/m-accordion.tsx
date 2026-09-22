'use client'

import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'

export interface AccordionSection {
  title: string
  summary?: string
  content: React.ReactNode
  open?: boolean
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

export function Accordion({
  id,
  sections,
  headingLevel = 2,
  rememberState = true,
  openAllLabel = 'Tout ouvrir',
  closeAllLabel = 'Tout masquer',
  openSectionLabel = 'Ouvrir',
  closeSectionLabel = 'Masquer',
}: {
  id: string
  sections: AccordionSection[]
  headingLevel?: number
  rememberState?: boolean
  openAllLabel?: string
  closeAllLabel?: string
  openSectionLabel?: string
  closeSectionLabel?: string
}) {
  const [openState, setOpenState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    sections.forEach((section, i) => {
      const sectionId = `${id}-section-${i + 1}`
      init[sectionId] = section.open ?? false
    })
    return init
  })
  const allOpen = Object.values(openState).every(Boolean) && Object.keys(openState).length > 0
  const ref = useRef<HTMLDivElement>(null)

  // Lecture de la mémorisation après hydratation : sessionStorage n'existe pas
  // côté serveur, le premier rendu est volontairement neutre (SSR). Disable
  // justifié : lecture d'un système externe, cas d'usage légitime de useEffect.
  useEffect(() => {
    if (!rememberState) return
    try {
      const stored = sessionStorage.getItem(`lpv-accordion-${id}`)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, boolean>
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed && typeof parsed === 'object') setOpenState(parsed)
      }
    } catch {}
  }, [id, rememberState])

  useEffect(() => {
    if (!rememberState) return
    try {
      sessionStorage.setItem(`lpv-accordion-${id}`, JSON.stringify(openState))
    } catch {}
  }, [openState, id, rememberState])

  function toggleSection(sectionId: string) {
    setOpenState((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  function toggleAll() {
    const newState = !allOpen
    const updated: Record<string, boolean> = {}
    Object.keys(openState).forEach((key) => {
      updated[key] = newState
    })
    setOpenState(updated)
  }

  return (
    <div className="lpv-m-accordion" id={id} ref={ref}>
      {sections.length > 1 && (
        <button
          className="lpv-m-accordion__bouton-tout"
          onClick={toggleAll}
          type="button"
        >
          {allOpen ? closeAllLabel : openAllLabel}
        </button>
      )}
      {sections.map((section, index) => {
        const sectionId = `${id}-section-${index + 1}`
        const isOpen = openState[sectionId] ?? section.open ?? false
        const buttonId = `${id}-bouton-${index + 1}`
        const contentId = `${id}-content-${index + 1}`

        return (
          <div className={`lpv-m-accordion__section${isOpen ? ' lpv-m-accordion__section--open' : ''}`} key={sectionId}>
            <div className="lpv-m-accordion__section-en-tete">
              <Heading className="lpv-m-accordion__titre" level={headingLevel}>
                <button
                  aria-controls={contentId}
                  aria-expanded={isOpen}
                  className="lpv-m-accordion__bouton"
                  id={buttonId}
                  onClick={() => toggleSection(sectionId)}
                  type="button"
                >
                  <span aria-hidden="true" className="lpv-m-accordion__icone">
                    <Icon icon={isOpen ? 'rivet-icons:chevron-up' : 'rivet-icons:chevron-down'} size={12} />
                  </span>
                  <span className="lpv-m-accordion__texte-bouton">{section.title}</span>
                  <span className="lpv-m-accordion__texte-toggle lpv-visually-hidden">
                    {isOpen ? closeSectionLabel : openSectionLabel}
                  </span>
                </button>
              </Heading>
              {section.summary && !isOpen ? (
                <div className="lpv-m-accordion__resume">{section.summary}</div>
              ) : null}
            </div>
            <div
              aria-labelledby={buttonId}
              className={`lpv-m-accordion__content${isOpen ? '' : ' lpv-m-accordion__content--cache'}`}
              id={contentId}
              role="region"
            >
              {section.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}
