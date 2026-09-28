import { Suspense } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LivreCatalogue, Pret } from '@/bibliotheque'

const pretsRetour: { data?: Pret[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const catalogueRetour: { data?: LivreCatalogue[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}

const searchParamsCourants = { params: new URLSearchParams() }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => searchParamsCourants.params,
  usePathname: () => '/profs/bibliotheque',
}))

vi.mock('@/bibliotheque', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/bibliotheque')>()
  return {
    ...original,
    useListTousPretsEnCours: () => pretsRetour,
    useListCatalogue: () => catalogueRetour,
    useMarquerRetourne: () => ({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    }),
  }
})

import BibliothequeView from '@/app/(frontend)/profs/bibliotheque/BibliothequeView'

const PRETS: Pret[] = [
  {
    id: 1,
    eleveId: 10,
    eleveLabel: 'Lucas Martin',
    exemplaireCode: 'LPV-0001',
    livreLabel: 'Le Petit Prince',
    dateRetourPrevue: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    dateRetourEffective: null,
  },
  {
    id: 2,
    eleveId: 11,
    eleveLabel: 'Emma Roux',
    exemplaireCode: 'LPV-0002',
    livreLabel: 'Vendredi',
    dateRetourPrevue: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    dateRetourEffective: null,
  },
]

const CATALOGUE: LivreCatalogue[] = [
  {
    id: 100,
    titre: 'Le Petit Prince',
    auteur: 'A. de Saint-Exupéry',
    niveau: 'primaire',
    categorie: 'lecture',
    archived: false,
    exemplaires: [{ id: 1, code: 'LPV-0001', etat: 'bon', disponible: false }],
  },
  {
    id: 101,
    titre: 'Le Seigneur des Anneaux',
    auteur: 'J.R.R. Tolkien',
    niveau: 'college',
    categorie: 'lecture',
    archived: false,
    exemplaires: [{ id: 2, code: 'LPV-0003', etat: 'neuf', disponible: true }],
  },
]

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>
        <BibliothequeView />
      </Suspense>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  searchParamsCourants.params = new URLSearchParams()
  pretsRetour.data = []
  pretsRetour.isLoading = false
  pretsRetour.isError = false
  catalogueRetour.data = []
  catalogueRetour.isLoading = false
  catalogueRetour.isError = false
})

describe('BibliothequeView', () => {
  it('affiche les stats catalogue prets et retards', () => {
    pretsRetour.data = PRETS
    catalogueRetour.data = CATALOGUE
    const { container } = rendre()

    expect(container.textContent).toContain('Bibliothèque')
    expect(container.textContent).toContain('Livres au catalogue')
    expect(container.textContent).toContain('Prêts en cours')
    expect(container.textContent).toContain('Retards')
  })

  it('liste les retards avec bouton retourne', () => {
    pretsRetour.data = PRETS
    const { container } = rendre()

    expect(container.textContent).toContain('Lucas Martin')
    expect(screen.getAllByRole('button', { name: 'Marquer comme retourné' }).length).toBe(1)
  })

  it('affiche le catalogue avec statut dispo et liens voir', () => {
    catalogueRetour.data = CATALOGUE
    const { container } = rendre()

    expect(container.textContent).toContain('Le Seigneur des Anneaux')
    expect(container.querySelectorAll('a[href="/profs/bibliotheque/livres/100"]').length).toBe(1)
  })

  it('affiche l etat vide retards', () => {
    rendre()

    expect(screen.getByText('Aucun retard. Tous les prêts sont dans les temps.')).toBeDefined()
  })

  it('filtre le catalogue par niveau', async () => {
    catalogueRetour.data = CATALOGUE
    const user = userEvent.setup()
    rendre()

    await user.selectOptions(screen.getByLabelText(/Filtrer par niveau/), 'college')

    await waitFor(() => {
      expect(screen.queryByText('Le Petit Prince')).toBeNull()
      expect(screen.getByText('Le Seigneur des Anneaux')).toBeDefined()
    })
  })

  it('affiche le toast pret enregistre via le parametre d url', async () => {
    searchParamsCourants.params = new URLSearchParams('pret=enregistre')

    rendre()

    await waitFor(() => {
      expect(screen.getByText('Prêt enregistré')).toBeDefined()
    })
  })

  it('conforme a la maquette : searchbar sous les stats, retards en action-row, sidebar en cards bordure haute', () => {
    pretsRetour.data = PRETS
    catalogueRetour.data = CATALOGUE
    const { container } = rendre()

    // Searchbar pleine largeur (hors section catalogue)
    expect(container.querySelector('.lpv-o-bibliotheque__searchbar')).not.toBeNull()
    expect(screen.getByText('Enregistrer un prêt')).toBeDefined()
    expect(
      container.querySelector('.lpv-o-bibliotheque__searchbar .lpv-a-button--success'),
    ).not.toBeNull()

    // Catalogue : molécule Table GOV.UK, pleine largeur
    expect(container.querySelector('.lpv-m-table')).not.toBeNull()
    expect(container.querySelector('.lpv-m-table')?.tagName.toLowerCase()).toBe('table')

    // Retards : ActionRow bordure gauche rouge + bouton secondaire
    expect(container.querySelectorAll('.lpv-m-action-row--red').length).toBe(1)

    // Sidebar : cards à bordure haute (aside-card), plus de Panel bleu
    expect(container.querySelectorAll('.lpv-t-dashboard-page__aside-card').length).toBe(2)
    expect(container.querySelectorAll('.lpv-a-panel').length).toBe(0)

    // Rappels : carte bleue sans icône
    expect(container.querySelectorAll('.lpv-m-alert-card--blue').length).toBe(1)

    // Caption maquette
    expect(container.textContent).toContain('ouvrages référencés')
  })
})