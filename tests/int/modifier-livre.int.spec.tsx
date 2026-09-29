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
    useModifierLivre: () => ({
      isPending: false,
      mutateAsync: mockModifierLivre,
    }),
  }
})

import ModifierLivreView from '@/app/(frontend)/profs/bibliotheque/livres/[id]/modifier/ModifierLivreView'

const LIVRE: LivreCatalogue = {
  id: 100,
  titre: 'Le Petit Prince',
  auteur: 'Antoine de Saint-Exupéry',
  isbn: '978-2-07-040850-4',
  resume: 'Ancien résumé.',
  editeur: 'Gallimard',
  niveau: 'primaire',
  categorie: 'lecture',
  archived: false,
  createdAt: '2024-09-15T00:00:00.000Z',
  exemplaires: [],
}

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ModifierLivreView livreId={100} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  catalogueRetour.data = [LIVRE]
  catalogueRetour.isLoading = false
  catalogueRetour.isError = false
  mockModifierLivre.mockReset().mockResolvedValue(undefined)
})

describe('ModifierLivreView (edition portail)', () => {
  it('preremplit le formulaire avec les valeurs du livre', async () => {
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
      expect(screen.getByLabelText(/Auteur/)).toHaveValue('Antoine de Saint-Exupéry')
      expect(screen.getByLabelText(/ISBN/)).toHaveValue('978-2-07-040850-4')
      expect(screen.getByLabelText(/Résumé/)).toHaveValue('Ancien résumé.')
    })
  })

  it('soumet les modifications apres confirmation', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
    })

    await user.clear(screen.getByLabelText(/Résumé/))
    await user.type(screen.getByLabelText(/Résumé/), 'Nouveau résumé.')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    // Confirmation demandée avant l'écriture
    await waitFor(() => {
      expect(screen.getByText('Enregistrer les modifications ?')).toBeDefined()
    })
    await user.click(screen.getAllByRole('button', { name: 'Enregistrer' })[1])

    await waitFor(() => {
      expect(mockModifierLivre).toHaveBeenCalledWith(
        expect.objectContaining({ id: 100, resume: 'Nouveau résumé.' }),
      )
      expect(screen.getByText('Fiche modifiée')).toBeDefined()
    })
  })

  it('exige un titre non vide', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
    })

    await user.clear(screen.getByLabelText('Titre'))
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(mockModifierLivre).not.toHaveBeenCalled()
    })
  })

  it('affiche l etat livre introuvable', () => {
    catalogueRetour.data = []
    rendre()

    expect(screen.getByText('Livre introuvable ou retiré du catalogue.')).toBeDefined()
  })
})