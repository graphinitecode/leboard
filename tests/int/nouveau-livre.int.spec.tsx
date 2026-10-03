import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LivreCatalogue } from '@/bibliotheque'

const catalogueRetour: { data?: LivreCatalogue[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const mockCreer = vi.fn().mockResolvedValue(999)
const mockCreerExemplaire = vi.fn().mockResolvedValue(undefined)

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
    useCreerLivre: () => ({ isPending: false, mutateAsync: mockCreer }),
    useCreerExemplaire: () => ({ isPending: false, mutateAsync: mockCreerExemplaire }),
  }
})

import NouveauLivreView from '@/app/(frontend)/profs/bibliotheque/livres/nouveau/NouveauLivreView'

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
]

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <NouveauLivreView />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  catalogueRetour.data = []
  mockCreer.mockClear().mockResolvedValue(999)
  mockCreerExemplaire.mockClear().mockResolvedValue(undefined)
})

describe('NouveauLivreView', () => {
  it('previent en direct et bloque la creation d un livre deja au catalogue', async () => {
    catalogueRetour.data = CATALOGUE
    const user = userEvent.setup()
    rendre()

    await user.type(screen.getByLabelText('Titre du livre'), 'Le Petit Prince')
    await user.type(screen.getByLabelText('Auteur'), 'A. de Saint-Exupéry')

    // Avertissement bloquant dès la saisie, avec le lien vers la fiche
    await waitFor(() => {
      expect(screen.getByText(/déjà au catalogue/)).toBeDefined()
    }, { timeout: 5000 })
    const lien = screen.getByRole('link', { name: 'Modifier le livre' }) as HTMLAnchorElement
    expect(lien.getAttribute('href')).toEqual('/profs/bibliotheque/livres/100/modifier')

    // Le submit est refusé : résumé d'erreurs, aucune création
    await user.click(screen.getByRole('button', { name: 'Ajouter au catalogue' }))
    await waitFor(() => {
      expect(screen.getByText(/Passez par la fiche du livre/)).toBeDefined()
    }, { timeout: 5000 })
    expect(mockCreer).not.toHaveBeenCalled()
    expect(mockCreerExemplaire).not.toHaveBeenCalled()
  })

  it('bloque aussi un ISBN deja reference', async () => {
    catalogueRetour.data = CATALOGUE
    const user = userEvent.setup()
    rendre()

    await user.type(screen.getByLabelText('Titre du livre'), 'Un autre titre')
    await user.type(screen.getByLabelText(/Pré-remplir avec l'ISBN/), '978-2-07-040850-4')

    await waitFor(() => {
      expect(screen.getByText(/même ISBN/)).toBeDefined()
    }, { timeout: 5000 })

    await user.click(screen.getByRole('button', { name: 'Ajouter au catalogue' }))
    expect(mockCreer).not.toHaveBeenCalled()
  })

  it('avertit sans bloquer quand le titre existe deja avec un autre ISBN', async () => {
    catalogueRetour.data = CATALOGUE
    const user = userEvent.setup()
    rendre()

    await user.type(screen.getByLabelText('Titre du livre'), 'Le Petit Prince')
    await user.type(screen.getByLabelText('Auteur'), 'A. de Saint-Exupéry')
    await user.type(screen.getByLabelText(/Pré-remplir avec l'ISBN/), '9781020345678')

    const avertissement = await waitFor(() => {
      expect(screen.getByText(/autre ISBN/)).toBeDefined()
      return screen.getByText(/autre ISBN/)
    }, { timeout: 5000 })
    expect(avertissement).toBeDefined()
    expect(screen.getByText(/Voir la fiche/)).toBeDefined()

    // La création reste possible : 1 livre + 1 exemplaire (défaut)
    await user.click(screen.getByRole('button', { name: 'Ajouter au catalogue' }))
    await waitFor(() => {
      expect(mockCreer).toHaveBeenCalledWith({
        auteur: 'A. de Saint-Exupéry',
        categorie: undefined,
        isbn: '9781020345678',
        niveau: undefined,
        resume: undefined,
        titre: 'Le Petit Prince',
      })
    })
    expect(mockCreerExemplaire).toHaveBeenCalledTimes(1)
  }, 15000)

  it('renvoie vers la page d import dediee', () => {
    rendre()

    const lien = screen.getByRole('link', {
      name: /Importer un fichier CSV/,
    }) as HTMLAnchorElement
    expect(lien.getAttribute('href')).toEqual('/profs/bibliotheque/livres/import')
  })
})