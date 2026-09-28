import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Eleve } from '@/students'

const hookRetour: { data?: Eleve[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/students', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/students')>()
  return {
    ...original,
    useListElevesDuProf: () => hookRetour,
  }
})

import ElevesView from '@/app/(frontend)/profs/eleves/ElevesView'

const elevesMock: Eleve[] = [
  { id: 1, prenom: 'Lucas', nom: 'Martin', niveau: 'CM2', groupe: 'Maths-CM2' },
  { id: 2, prenom: 'Emma', nom: 'Roux', niveau: '5e', groupe: null },
]

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ElevesView profId={1} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  hookRetour.data = []
  hookRetour.isLoading = false
  hookRetour.isError = false
})

describe('ElevesView (liste des eleves du prof)', () => {
  it('affiche l etat vide quand aucun eleve', () => {
    const { container } = rendre()

    expect(container.textContent).toContain('Aucun élève')
  })

  it('affiche la liste des eleves avec niveau et lien fiche', () => {
    hookRetour.data = elevesMock
    const { container } = rendre()

    expect(container.textContent).toContain('Lucas')
    expect(container.textContent).toContain('Emma')
    expect(screen.getAllByText('CM2').length).toBeGreaterThan(0)
    expect(screen.getAllByText('5e').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('a[href="/profs/eleves/1"]').length).toBe(1)
    expect(container.querySelectorAll('a[href="/profs/eleves/2"]').length).toBe(1)
  })

  it('affiche le message d erreur en cas d echec de chargement', () => {
    hookRetour.isError = true
    rendre()

    expect(screen.getByText(/Impossible de charger vos élèves/)).toBeDefined()
  })
})