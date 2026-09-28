import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LivreCatalogue, Pret } from '@/bibliotheque'

const catalogueRetour: { data?: LivreCatalogue[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const pretsLivreRetour: { data?: Pret[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const mockMarquerRetourne = vi.fn()
const mockModifierLivre = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/profs/bibliotheque',
}))

vi.mock('@/bibliotheque', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/bibliotheque')>()
  return {
    ...original,
    useListCatalogue: () => catalogueRetour,
    useListPretsParLivre: () => pretsLivreRetour,
    useMarquerRetourne: () => ({
      isPending: false,
      mutateAsync: mockMarquerRetourne,
    }),
    useModifierLivre: () => ({
      isPending: false,
      mutateAsync: mockModifierLivre,
    }),
  }
})

import FicheLivreView from '@/app/(frontend)/profs/bibliotheque/livres/[id]/FicheLivreView'

const LIVRE: LivreCatalogue = {
  id: 100,
  titre: 'Le Petit Prince',
  auteur: 'Antoine de Saint-Exupéry',
  isbn: '978-2-07-040850-4',
  resume: "Un aviateur rencontre un petit garçon venu d'une autre planète.",
  editeur: 'Gallimard',
  niveau: 'primaire',
  categorie: 'lecture',
  archived: false,
  createdAt: '2024-09-15T00:00:00.000Z',
  exemplaires: [
    { id: 1, code: 'LPV-0001', etat: 'bon', disponible: false },
    { id: 2, code: 'LPV-0002', etat: 'neuf', disponible: true },
  ],
}

const JOUR = 86_400_000

const PRETS: Pret[] = [
  {
    id: 1,
    eleveId: 10,
    eleveLabel: 'Lucas Martin',
    exemplaireCode: 'LPV-0001',
    livreLabel: 'Le Petit Prince',
    dateEmprunt: new Date(Date.now() - 29 * JOUR).toISOString(),
    dateRetourPrevue: new Date(Date.now() - 8 * JOUR).toISOString(),
    dateRetourEffective: null,
  },
  {
    id: 2,
    eleveId: 11,
    eleveLabel: 'Emma Roux',
    exemplaireCode: 'LPV-0002',
    livreLabel: 'Le Petit Prince',
    dateEmprunt: new Date(Date.now() - 60 * JOUR).toISOString(),
    dateRetourPrevue: new Date(Date.now() - 39 * JOUR).toISOString(),
    dateRetourEffective: new Date(Date.now() - 40 * JOUR).toISOString(),
  },
]

const rendre = (peutGerer = true) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <FicheLivreView livreId={100} peutGerer={peutGerer} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  catalogueRetour.data = [LIVRE]
  catalogueRetour.isLoading = false
  catalogueRetour.isError = false
  pretsLivreRetour.data = []
  pretsLivreRetour.isLoading = false
  pretsLivreRetour.isError = false
  mockMarquerRetourne.mockReset().mockResolvedValue(undefined)
  mockModifierLivre.mockReset().mockResolvedValue(undefined)
})

describe('FicheLivreView (alignee maquette)', () => {
  it('affiche titre, caption auteur, tag statut et les trois stats', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Le Petit Prince')
    expect(screen.getByText('Antoine de Saint-Exupéry')).toBeDefined()
    expect(screen.getAllByText('Disponible').length).toBeGreaterThan(0)
    expect(container.textContent).toContain('Niveau conseillé')
    expect(container.textContent).toContain('1 / 2')
    expect(container.textContent).toContain('Retard sur')
    expect(container.textContent).toContain('8 jours')
  })

  it('affiche le resume et l historique des emprunts en table', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre()

    expect(container.textContent).toContain("Un aviateur rencontre un petit garçon")
    expect(container.querySelector('.lpv-m-table')).not.toBeNull()
    expect(container.textContent).toContain('Lucas Martin')
    expect(screen.getByText('En retard')).toBeDefined()
    expect(screen.getByText('Rendu')).toBeDefined()
  })

  it('affiche la sidebar actions retard et informations pour un gerant', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre()

    expect(container.textContent).toContain('Actions')
    expect(container.textContent).toContain('Retard en cours')
    expect(container.textContent).toContain('Informations')
    expect(container.textContent).toContain('978-2-07-040850-4')
    expect(container.textContent).toContain('Exemplaires')
    expect(container.textContent).toContain('Ajouté au catalogue')
    expect(screen.getByText('Modifier la fiche')).toBeDefined()
  })

  it('masque les actions pour un prof (lecture seule)', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre(false)

    expect(container.textContent).not.toContain('Actions')
    expect(screen.queryByText('Modifier la fiche')).toBeNull()
    expect(container.textContent).toContain('Informations')
  })

  it('affiche l etat livre introuvable', () => {
    catalogueRetour.data = []
    rendre()

    expect(screen.getByText('Livre introuvable ou retiré du catalogue.')).toBeDefined()
  })
})