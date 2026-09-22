import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Table } from '@/components/molecules/m-table'
import type { TableauHeadCell, TableauRowCell } from '@/components/molecules/m-table'

const head: TableauHeadCell[] = [
  { texte: 'Nom' },
  { texte: 'Âge', format: 'numerique' },
]

const rows: TableauRowCell[][] = [
  [{ texte: 'Alice' }, { texte: '30', format: 'numerique' }],
  [{ texte: 'Bob' }, { texte: '25', format: 'numerique' }],
]

describe('Tableau', () => {
  it('affiche la légende et les en-têtes', () => {
    render(<Table caption="Liste" head={head} rows={rows} />)
    expect(screen.getAllByText('Liste').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Nom')).toBeDefined()
    expect(screen.getByText('Âge')).toBeDefined()
  })

  it('affiche les données des lignes', () => {
    render(<Table caption="Liste" head={head} rows={rows} />)
    expect(screen.getAllByText('Alice').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Bob').length).toBeGreaterThanOrEqual(1)
  })

  it('affiche du contenu React dans une cellule via contenu', () => {
    const rowsWithReactNode: TableauRowCell[][] = [
      [{ texte: 'Alice' }, { contenu: <strong>Important</strong> }],
    ]
    render(<Table caption="Liste" head={head} rows={rowsWithReactNode} />)
    expect(screen.getByText('Important')).toBeDefined()
  })

  it('utilise th pour la première colonne quand premiereCelluleEntete', () => {
    render(<Table caption="Liste" head={head} rows={rows} premiereCelluleEntete />)
    const thElements = screen.getAllByRole('rowheader')
    expect(thElements.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche la légende avec la taille xl', () => {
    const { container } = render(<Table caption="Liste" head={head} rows={rows} captionTaille="xl" />)
    const caption = container.querySelector('.lpv-tableau__legende--xl')
    expect(caption).not.toBeNull()
  })
})
