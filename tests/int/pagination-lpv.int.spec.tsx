import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Pagination } from '@/components/molecules/m-pagination'

const items = [
  { number: 1, href: '#p1' },
  { number: 2, href: '#p2', current: true },
  { number: 3, href: '#p3' },
]

describe('Pagination', () => {
  it('affiche les numeros de page', () => {
    render(<Pagination items={items} />)
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('marque la page courante avec aria-current et sans lien', () => {
    render(<Pagination items={items} />)
    const span = screen.getAllByText(/page actuelle/)[0]
    const courante = span.closest('strong')
    expect(courante).not.toBeNull()
    expect(courante?.getAttribute('aria-current')).toBe('page')
    expect(courante?.tagName).toBe('STRONG')
  })

  it('affiche precedente et suivante quand fournies', () => {
    render(<Pagination items={items} previous={{ href: '#prev' }} next={{ href: '#next' }} />)
    expect(screen.getByText('Précédent')).toBeDefined()
    expect(screen.getByText('Suivant')).toBeDefined()
  })

  it('n’affiche pas precedente si absente (premiere page)', () => {
    render(<Pagination items={items} next={{ href: '#next' }} />)
    expect(screen.queryByText('Précédent')).toBeNull()
    expect(screen.getByText('Suivant')).toBeDefined()
  })

  it('n’affiche pas suivante si absente (derniere page)', () => {
    render(<Pagination items={items} previous={{ href: '#prev' }} />)
    expect(screen.getByText('Précédent')).toBeDefined()
    expect(screen.queryByText('Suivant')).toBeNull()
  })

  it('affiche les ellipsis', () => {
    render(
      <Pagination
        items={[
          { number: 1, href: '#p1' },
          { ellipsis: true },
          { number: 42, href: '#p42', current: true },
        ]}
      />,
    )
    expect(screen.getAllByText('…').length).toBeGreaterThanOrEqual(1)
  })
})