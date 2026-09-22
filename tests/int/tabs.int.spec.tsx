import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabs } from '@/components/molecules/m-tabs'
import type { Tab } from '@/components/molecules/m-tabs'

const tabItems: Tab[] = [
  { id: 'tab-1', label: 'Premier', content: <p>Contenu premier</p> },
  { id: 'tab-2', label: 'Deuxième', content: <p>Contenu deuxième</p> },
]

describe('Tabs', () => {
  it('affiche le premier onglet comme actif par défaut', () => {
    render(<Tabs id="test-tabs" tabs={tabItems} />)
    const tabElements = screen.getAllByRole('tab')
    expect(tabElements[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabElements[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('change l\'onglet actif au clic', () => {
    render(<Tabs id="test-tabs2" tabs={tabItems} />)
    const tabElements = screen.getAllByRole('tab')
    fireEvent.click(tabElements[1])
    expect(tabElements[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('affiche le contenu du premier onglet', () => {
    render(<Tabs id="test-tabs3" tabs={tabItems} />)
    expect(screen.getAllByText('Contenu premier').length).toBeGreaterThanOrEqual(1)
  })

  it('ne rend rien si onglets est vide', () => {
    const { container } = render(<Tabs id="test-tabs5" tabs={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('associe les tabs aux panels via aria-controls', () => {
    render(<Tabs id="test-tabs6" tabs={tabItems} />)
    const tabElements = screen.getAllByRole('tab')
    expect(tabElements[0]).toHaveAttribute('aria-controls', 'panel-tab-1')
    expect(tabElements[1]).toHaveAttribute('aria-controls', 'panel-tab-2')
  })
})
