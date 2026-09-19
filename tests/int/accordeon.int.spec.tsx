import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Accordeon } from '@/components/molecules/Accordeon'

const sections = [
  { titre: 'Section un', contenu: <p>Contenu un</p> },
  { titre: 'Section deux', contenu: <p>Contenu deux</p> },
]

describe('Accordeon', () => {
  it('affiche toutes les sections', () => {
    render(<Accordeon id="test-acc" sections={sections} />)
    const buttons = screen.getAllByRole('button')
    const sectionUnBtn = buttons.find((b) => b.textContent?.includes('Section un'))
    const sectionDeuxBtn = buttons.find((b) => b.textContent?.includes('Section deux'))
    expect(sectionUnBtn).toBeDefined()
    expect(sectionDeuxBtn).toBeDefined()
  })

  it('affiche un bouton tout ouvrir quand il y a plusieurs sections', () => {
    render(<Accordeon id="test-acc" sections={sections} />)
    const toutOuvrirButtons = screen.getAllByRole('button', { name: 'Tout ouvrir' })
    expect(toutOuvrirButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('ne montre pas de bouton tout ouvrir pour une seule section', () => {
    const { container } = render(<Accordeon id="test-acc1" sections={[sections[0]]} />)
    const toutOuvrirBtn = container.querySelector('.lpv-accordeon__bouton-tout')
    expect(toutOuvrirBtn).toBeNull()
  })

  it('bascule une section au clic', () => {
    render(<Accordeon id="test-acc2" sections={sections} souvenirOuverture={false} />)
    const buttons = screen.getAllByRole('button')
    const bouton = buttons.find((b) => b.textContent?.includes('Section un'))!
    expect(bouton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(bouton)
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
  })

  it('affiche le résumé quand la section est fermée', () => {
    render(
      <Accordeon
        id="test-acc4"
        sections={[{ titre: 'Avec résumé', resume: 'Résumé visible', contenu: <p>Contenu</p> }]}
      />,
    )
    expect(screen.getAllByText('Résumé visible').length).toBeGreaterThanOrEqual(1)
  })
})