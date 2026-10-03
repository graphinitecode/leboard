import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { buildPaginationItems, Pagination } from '@/components/molecules/m-pagination'

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

describe('buildPaginationItems', () => {
  const hrefFor = (page: number) => `?page=${page}`
  const numeros = (items: ReturnType<typeof buildPaginationItems>) =>
    items.filter((item): item is { number: number; href: string; current?: boolean } => 'number' in item).map((item) => item.number)

  it('retourne vide pour une seule page', () => {
    expect(buildPaginationItems({ currentPage: 1, hrefFor, totalPages: 1 })).toEqual([])
  })

  it('liste toutes les pages sans ellipsis jusqu a 7', () => {
    const list = buildPaginationItems({ currentPage: 3, hrefFor, totalPages: 7 })
    expect(numeros(list)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(list.some((item) => 'ellipsis' in item)).toBe(false)
  })

  it('marque la page courante et construit les liens via hrefFor', () => {
    const list = buildPaginationItems({ currentPage: 2, hrefFor, totalPages: 3 })
    const courante = list.find((item) => 'current' in item && item.current)
    expect(courante).toEqual({ current: true, href: '?page=2', number: 2 })
  })

  it('encadre la courante d ellipsis au dela de 7 pages', () => {
    const list = buildPaginationItems({ currentPage: 6, hrefFor, totalPages: 10 })
    expect(numeros(list)).toEqual([1, 4, 5, 6, 7, 8, 10])
    expect(list.filter((item) => 'ellipsis' in item).length).toBe(2)
  })

  it('elargit la fenetre pres du debut', () => {
    const list = buildPaginationItems({ currentPage: 1, hrefFor, totalPages: 10 })
    expect(numeros(list)).toEqual([1, 2, 3, 4, 5, 10])
    expect(list.filter((item) => 'ellipsis' in item).length).toBe(1)
  })

  it('elargit la fenetre pres de la fin', () => {
    const list = buildPaginationItems({ currentPage: 10, hrefFor, totalPages: 10 })
    expect(numeros(list)).toEqual([1, 6, 7, 8, 9, 10])
    expect(list.filter((item) => 'ellipsis' in item).length).toBe(1)
  })
})