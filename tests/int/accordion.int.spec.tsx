import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Accordion } from '@/components/molecules/m-accordion'

const sections = [
  { title: 'Section un', content: <p>Contenu un</p> },
  { title: 'Section deux', content: <p>Contenu deux</p> },
]

describe('Accordion', () => {
  it('affiche toutes les sections', () => {
    render(<Accordion id="test-acc" sections={sections} />)
    const buttons = screen.getAllByRole('button')
    const sectionUnBtn = buttons.find((b) => b.textContent?.includes('Section un'))
    const sectionDeuxBtn = buttons.find((b) => b.textContent?.includes('Section deux'))
    expect(sectionUnBtn).toBeDefined()
    expect(sectionDeuxBtn).toBeDefined()
  })

  it('affiche un bouton tout ouvrir quand il y a plusieurs sections', () => {
    render(<Accordion id="test-acc" sections={sections} />)
    const toutOuvrirButtons = screen.getAllByRole('button', { name: 'Tout ouvrir' })
    expect(toutOuvrirButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('ne montre pas de bouton tout ouvrir pour une seule section', () => {
    const { container } = render(<Accordion id="test-acc1" sections={[sections[0]]} />)
    const toutOuvrirBtn = container.querySelector('.lpv-m-accordion__toggle-all')
    expect(toutOuvrirBtn).toBeNull()
  })

  it('bascule une section au clic', () => {
    render(<Accordion id="test-acc2" sections={sections} rememberState={false} />)
    const buttons = screen.getAllByRole('button')
    const bouton = buttons.find((b) => b.textContent?.includes('Section un'))!
    expect(bouton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(bouton)
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
  })

  it('affiche le résumé quand la section est fermée', () => {
    render(
      <Accordion
        id="test-acc4"
        sections={[{ title: 'Avec résumé', summary: 'Résumé visible', content: <p>Contenu</p> }]}
      />,
    )
    expect(screen.getAllByText('Résumé visible').length).toBeGreaterThanOrEqual(1)
  })
})