import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Table } from '@/components/molecules/m-table'
import type { TableHeadCell, TableRowCell } from '@/components/molecules/m-table'

const head: TableHeadCell[] = [
  { text: 'Nom' },
  { text: 'Âge', format: 'numeric' },
]

const rows: TableRowCell[][] = [
  [{ text: 'Alice' }, { text: '30', format: 'numeric' }],
  [{ text: 'Bob' }, { text: '25', format: 'numeric' }],
]

describe('Table', () => {
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
    const rowsWithReactNode: TableRowCell[][] = [
      [{ text: 'Alice' }, { content: <strong>Important</strong> }],
    ]
    render(<Table caption="Liste" head={head} rows={rowsWithReactNode} />)
    expect(screen.getByText('Important')).toBeDefined()
  })

  it('utilise th pour la première colonne quand firstColumnHeader', () => {
    render(<Table caption="Liste" head={head} rows={rows} firstColumnHeader />)
    const thElements = screen.getAllByRole('rowheader')
    expect(thElements.length).toBeGreaterThanOrEqual(1)
  })

  it('affiche la légende avec la taille xl', () => {
    const { container } = render(<Table caption="Liste" head={head} rows={rows} captionSize="xl" />)
    const caption = container.querySelector('.lpv-m-table__caption--xl')
    expect(caption).not.toBeNull()
  })
})
