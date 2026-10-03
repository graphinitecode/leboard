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
const mockRouterReplace = vi.fn()
const mockMarquerRetourne = vi.fn().mockResolvedValue(undefined)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: mockRouterReplace }),
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
      mutateAsync: mockMarquerRetourne,
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
    dateEmprunt: new Date(Date.now() - 29 * 86_400_000).toISOString(),
    dateRetourPrevue: new Date(Date.now() - 8 * 86_400_000).toISOString(),
    dateRetourEffective: null,
  },
  {
    id: 2,
    eleveId: 11,
    eleveLabel: 'Emma Roux',
    exemplaireCode: 'LPV-0002',
    livreLabel: 'Vendredi',
    dateEmprunt: new Date(Date.now() - 19 * 86_400_000).toISOString(),
    dateRetourPrevue: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    dateRetourEffective: null,
  },
]

const CATALOGUE: LivreCatalogue[] = [
  {
    id: 100,
    titre: 'Le Petit Prince',
    auteur: 'A. de Saint-Exupéry',
    isbn: '978-2-07-040850-4',
    resume: null,
    editeur: 'Gallimard',
    niveau: 'primaire',
    categorie: 'lecture',
    archived: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    exemplaires: [{ id: 1, code: 'LPV-0001', etat: 'bon', disponible: false }],
  },
  {
    id: 101,
    titre: 'Le Seigneur des Anneaux',
    auteur: 'J.R.R. Tolkien',
    isbn: null,
    resume: null,
    editeur: null,
    niveau: 'college',
    categorie: 'lecture',
    archived: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    exemplaires: [{ id: 2, code: 'LPV-0003', etat: 'neuf', disponible: true }],
  },
]

const livreTest = (index: number): LivreCatalogue => ({
  id: 200 + index,
  titre: `Livre ${String(index + 1).padStart(2, '0')}`,
  auteur: null,
  isbn: null,
  resume: null,
  editeur: null,
  niveau: 'college',
  categorie: 'lecture',
  archived: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  exemplaires: [{ id: index, code: `LPV-${String(index + 1).padStart(4, '0')}`, etat: 'bon', disponible: true }],
})

const livresDeTest = (quantite: number): LivreCatalogue[] =>
  Array.from({ length: quantite }, (_, index) => livreTest(index))

const rendre = (peutGerer = true) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>
        <BibliothequeView peutGerer={peutGerer} />
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
  mockRouterReplace.mockClear()
  mockMarquerRetourne.mockReset().mockResolvedValue(undefined)
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

  it('demande le mot de passe avant de marquer un retard retourné', async () => {
    pretsRetour.data = PRETS
    const user = userEvent.setup()
    rendre()

    await user.click(screen.getByRole('button', { name: 'Marquer comme retourné' }))

    // Modale mot de passe visible, bouton confirmé désactivé sans saisie
    expect(screen.getByText('Marquer ce prêt comme retourné ?')).toBeDefined()
    const champ = screen.getByLabelText('Mot de passe du compte connecté')
    expect(champ).toBeDefined()

    const confirmer = screen.getByRole('button', { name: 'Confirmer le retour' })
    expect((confirmer as HTMLButtonElement).disabled).toBe(true)

    // Saisie puis confirmation : la mutation reçoit { motDePasse, pretId }
    await user.type(champ, 'secret')
    expect((confirmer as HTMLButtonElement).disabled).toBe(false)
    await user.click(confirmer)

    await waitFor(() => {
      expect(mockMarquerRetourne).toHaveBeenCalledWith({ motDePasse: 'secret', pretId: 1 })
    })
  })

  it('ferme la modale sans mutation via Annuler', async () => {
    pretsRetour.data = PRETS
    const user = userEvent.setup()
    rendre()

    await user.click(screen.getByRole('button', { name: 'Marquer comme retourné' }))
    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    await waitFor(() => {
      expect(screen.queryByText('Marquer ce prêt comme retourné ?')).toBeNull()
    })
    expect(mockMarquerRetourne).not.toHaveBeenCalled()
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
    // Texte de présentation (le nombre d'ouvrages vit dans les stats)
    expect(container.textContent).toContain('Gérez le catalogue')
  })

  it('pagine le catalogue par lots de 10', () => {
    catalogueRetour.data = livresDeTest(23)
    const { container } = rendre()

    expect(container.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toBe(10)
    expect(screen.getByRole('navigation', { name: 'Pagination du catalogue' })).toBeDefined()
    expect(screen.queryByText('Précédent')).toBeNull()
    expect(container.querySelector('a[href="/profs/bibliotheque?page=2"]')).not.toBeNull()
  })

  it('affiche la page 2 via le parametre url avec bornes precedentes/suivantes', () => {
    catalogueRetour.data = livresDeTest(23)
    searchParamsCourants.params = new URLSearchParams('page=2')
    const { container } = rendre()

    expect(container.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toBe(10)
    expect(screen.getByText('Précédent')).toBeDefined()
    expect(screen.getByText('Suivant')).toBeDefined()
    // Page 1 sans paramètre (URL canonique) ; page 3 avec ?page=3
    expect(
      container.querySelector('.lpv-m-pagination__previous a[href="/profs/bibliotheque"]'),
    ).not.toBeNull()
    expect(container.querySelector('a[href="/profs/bibliotheque?page=3"]')).not.toBeNull()
  })

  it('borne la page demandee au total de pages', () => {
    catalogueRetour.data = livresDeTest(23)
    searchParamsCourants.params = new URLSearchParams('page=99')
    const { container } = rendre()

    expect(container.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toBe(3)
  })

  it('n affiche pas de pagination sous une page de resultats', () => {
    catalogueRetour.data = CATALOGUE
    const { container } = rendre()

    expect(container.querySelector('.lpv-m-pagination')).toBeNull()
  })

  it('remet a la page 1 quand le filtre change', async () => {
    catalogueRetour.data = livresDeTest(23)
    searchParamsCourants.params = new URLSearchParams('page=2')
    const user = userEvent.setup()
    rendre()

    await user.selectOptions(screen.getByLabelText(/Filtrer par niveau/), 'primaire')

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith('/profs/bibliotheque')
    })
  })
})