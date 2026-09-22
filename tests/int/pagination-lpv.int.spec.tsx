import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PaginationLPV } from '@/components/molecules/m-pagination'

const items = [
  { numero: 1, href: '#p1' },
  { numero: 2, href: '#p2', courant: true },
  { numero: 3, href: '#p3' },
]

describe('PaginationLPV', () => {
  it('affiche les numeros de page', () => {
    render(<PaginationLPV items={items} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('marque la page courante avec aria-current et sans lien', () => {
    render(<PaginationLPV items={items} />)
    const span = screen.getAllByText(/page actuelle/)[0]
    const courante = span.closest('strong')
    expect(courante).not.toBeNull()
    expect(courante?.getAttribute('aria-current')).toBe('page')
    expect(courante?.tagName).toBe('STRONG')
  })

  it('affiche precedente et suivante quand fournies', () => {
    render(<PaginationLPV items={items} precedente={{ href: '#prev' }} suivante={{ href: '#next' }} />)
    expect(screen.getByText('Précédent')).toBeDefined()
    expect(screen.getByText('Suivant')).toBeDefined()
  })

  it('n’affiche pas precedente si absente (premiere page)', () => {
    render(<PaginationLPV items={items} suivante={{ href: '#next' }} />)
    expect(screen.queryByText('Précédent')).toBeNull()
    expect(screen.getByText('Suivant')).toBeDefined()
  })

  it('n’affiche pas suivante si absente (derniere page)', () => {
    render(<PaginationLPV items={items} precedente={{ href: '#prev' }} />)
    expect(screen.getByText('Précédent')).toBeDefined()
    expect(screen.queryByText('Suivant')).toBeNull()
  })

  it('affiche les ellipsis', () => {
    render(
      <PaginationLPV
        items={[
          { numero: 1, href: '#p1' },
          { ellipsis: true },
          { numero: 42, href: '#p42', courant: true },
        ]}
      />,
    )
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
  })
})