import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabs } from '@/components/molecules/m-tabs'
import type { Onglet } from '@/components/molecules/m-tabs'

const onglets: Onglet[] = [
  { id: 'tab-1', libelle: 'Premier', contenu: <p>Contenu premier</p> },
  { id: 'tab-2', libelle: 'Deuxième', contenu: <p>Contenu deuxième</p> },
]

describe('Onglets', () => {
  it('affiche le premier onglet comme actif par défaut', () => {
    render(<Tabs id="test-tabs" onglets={onglets} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('change l\'onglet actif au clic', () => {
    render(<Tabs id="test-tabs2" onglets={onglets} />)
    const tabs = screen.getAllByRole('tab')
    fireEvent.click(tabs[1])
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('affiche le contenu du premier onglet', () => {
    render(<Tabs id="test-tabs3" onglets={onglets} />)
    expect(screen.getAllByText('Contenu premier').length).toBeGreaterThanOrEqual(1)
  })

  it('ne rend rien si onglets est vide', () => {
    const { container } = render(<Tabs id="test-tabs5" onglets={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('associe les tabs aux panels via aria-controls', () => {
    render(<Tabs id="test-tabs6" onglets={onglets} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-controls', 'panel-tab-1')
    expect(tabs[1]).toHaveAttribute('aria-controls', 'panel-tab-2')
  })
})
