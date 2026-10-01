import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
const mockModifierLivre = vi.fn()
const mockCreerExemplaire = vi.fn()
const mockSupprimerExemplaire = vi.fn()

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
    useModifierLivre: () => ({
      isPending: false,
      mutateAsync: mockModifierLivre,
    }),
    useCreerExemplaire: () => ({
      isPending: false,
      mutateAsync: mockCreerExemplaire,
    }),
    useSupprimerExemplaire: () => ({
      isPending: false,
      mutateAsync: mockSupprimerExemplaire,
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
  exemplaires: [
    { id: 1, code: 'LPV-0001', etat: 'bon', disponible: false },
    { id: 2, code: 'LPV-0002', etat: 'neuf', disponible: true },
  ],
}

const JOUR = 86_400_000

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
  pretsLivreRetour.data = []
  pretsLivreRetour.isLoading = false
  pretsLivreRetour.isError = false
  mockModifierLivre.mockReset().mockResolvedValue(undefined)
  mockCreerExemplaire.mockReset().mockResolvedValue(undefined)
  mockSupprimerExemplaire.mockReset().mockResolvedValue(undefined)
})

describe('ModifierLivreView (maquette update-book)', () => {
  it('preremplit le formulaire avec les valeurs actuelles du livre', async () => {
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
      expect(screen.getByLabelText(/Auteur/)).toHaveValue('Antoine de Saint-Exupéry')
      expect(screen.getByLabelText(/ISBN/)).toHaveValue('978-2-07-040850-4')
      expect(screen.getByLabelText(/Nombre d'exemplaires/)).toHaveValue(2)
      expect(screen.getByLabelText(/Résumé/)).toHaveValue('Ancien résumé.')
    })
  })

  it('n affiche pas de widget de recherche par ISBN (creation seulement)', async () => {
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText(/ISBN/)).toHaveValue('978-2-07-040850-4')
    })
    expect(screen.queryByRole('button', { name: 'Rechercher' })).toBeNull()
  })

  it('soumet directement sans encart de confirmation', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
    })

    await user.clear(screen.getByLabelText(/Auteur/))
    await user.type(screen.getByLabelText(/Auteur/), 'Nouvel auteur.')
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(mockModifierLivre).toHaveBeenCalledTimes(1)
      expect(mockModifierLivre).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 100,
          titre: 'Le Petit Prince',
          auteur: 'Nouvel auteur.',
          isbn: '9782070408504',
          resume: 'Ancien résumé.',
        }),
      )
      expect(screen.getByText('Modifications enregistrées')).toBeDefined()
      expect(screen.getByText('« Le Petit Prince » a été mis à jour.')).toBeDefined()
    })
  })

  it('vide les champs optionnels remis a blanc (null, pas de valeur figee)', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText(/ISBN/)).toHaveValue('978-2-07-040850-4')
    })

    await user.clear(screen.getByLabelText(/ISBN/))
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(mockModifierLivre).toHaveBeenCalledWith(
        expect.objectContaining({ id: 100, isbn: null }),
      )
    })
  })

  it('signale un titre vide dans le resume des erreurs', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
    })

    await user.clear(screen.getByLabelText('Titre'))
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(screen.getByText('Saisis le titre du livre')).toBeDefined()
    })
    expect(mockModifierLivre).not.toHaveBeenCalled()
  })

  it('rappelle que des exemplaires sont pretes et bloque la descente en dessous', async () => {
    const user = userEvent.setup()
    pretsLivreRetour.data = [
      {
        id: 1,
        eleveId: 10,
        eleveLabel: 'Lucas Martin',
        exemplaireCode: 'LPV-0001',
        livreLabel: 'Le Petit Prince',
        dateEmprunt: new Date(Date.now() - 5 * JOUR).toISOString(),
        dateRetourPrevue: new Date(Date.now() + 16 * JOUR).toISOString(),
        dateRetourEffective: null,
      },
    ]
    rendre()

    await waitFor(() => {
      expect(
        screen.getByText('1 exemplaire est actuellement prêté — tu ne peux pas descendre en dessous.'),
      ).toBeDefined()
    })

    const champ = screen.getByLabelText(/Nombre d'exemplaires/)
    await user.clear(champ)
    await user.type(champ, '0')
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(
        screen.getByText(
          "Saisis le nombre d'exemplaires (1 minimum, au moins autant que d'exemplaires actuellement prêtés)",
        ),
      ).toBeDefined()
    })
    expect(mockModifierLivre).not.toHaveBeenCalled()
    expect(mockSupprimerExemplaire).not.toHaveBeenCalled()
  })

  it('augmente le nombre d exemplaires en creant ceux qui manquent', async () => {
    const user = userEvent.setup()
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre d'exemplaires/)).toHaveValue(2)
    })

    const champ = screen.getByLabelText(/Nombre d'exemplaires/)
    await user.clear(champ)
    await user.type(champ, '3')
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(mockModifierLivre).toHaveBeenCalledTimes(1)
      expect(mockCreerExemplaire).toHaveBeenCalledTimes(1)
      expect(mockCreerExemplaire).toHaveBeenCalledWith({ livre: 100 })
      expect(mockSupprimerExemplaire).not.toHaveBeenCalled()
    })
  })

  it('diminue le nombre en retirant le plus recent exemplaire sans historique', async () => {
    const user = userEvent.setup()
    // LPV-0001 a été emprunté (retourné) : il porte l'historique et reste ;
    // LPV-0002, plus récent et sans prêt, est retiré.
    catalogueRetour.data = [
      {
        ...LIVRE,
        exemplaires: [
          { id: 1, code: 'LPV-0001', etat: 'bon', disponible: true },
          { id: 2, code: 'LPV-0002', etat: 'neuf', disponible: true },
        ],
      },
    ]
    pretsLivreRetour.data = [
      {
        id: 1,
        eleveId: 10,
        eleveLabel: 'Lucas Martin',
        exemplaireCode: 'LPV-0001',
        livreLabel: 'Le Petit Prince',
        dateEmprunt: new Date(Date.now() - 30 * JOUR).toISOString(),
        dateRetourPrevue: new Date(Date.now() - 9 * JOUR).toISOString(),
        dateRetourEffective: new Date(Date.now() - 7 * JOUR).toISOString(),
      },
    ]
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre d'exemplaires/)).toHaveValue(2)
    })

    const champ = screen.getByLabelText(/Nombre d'exemplaires/)
    await user.clear(champ)
    await user.type(champ, '1')
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(mockModifierLivre).toHaveBeenCalledTimes(1)
      expect(mockSupprimerExemplaire).toHaveBeenCalledTimes(1)
      expect(mockSupprimerExemplaire).toHaveBeenCalledWith({ id: 2 })
    })
  })

  it('bloque la descente sous les exemplaires porteurs d historique', async () => {
    const user = userEvent.setup()
    // Deux exemplaires avec historique de prêt, un seul clean : plancher = 2.
    catalogueRetour.data = [
      {
        ...LIVRE,
        exemplaires: [
          { id: 1, code: 'LPV-0001', etat: 'bon', disponible: true },
          { id: 2, code: 'LPV-0002', etat: 'bon', disponible: true },
          { id: 3, code: 'LPV-0003', etat: 'neuf', disponible: true },
        ],
      },
    ]
    pretsLivreRetour.data = [
      {
        id: 1,
        eleveId: 10,
        eleveLabel: 'Lucas Martin',
        exemplaireCode: 'LPV-0001',
        livreLabel: 'Le Petit Prince',
        dateEmprunt: new Date(Date.now() - 30 * JOUR).toISOString(),
        dateRetourPrevue: new Date(Date.now() - 9 * JOUR).toISOString(),
        dateRetourEffective: new Date(Date.now() - 8 * JOUR).toISOString(),
      },
      {
        id: 2,
        eleveId: 11,
        eleveLabel: 'Emma Roux',
        exemplaireCode: 'LPV-0002',
        livreLabel: 'Le Petit Prince',
        dateEmprunt: new Date(Date.now() - 40 * JOUR).toISOString(),
        dateRetourPrevue: new Date(Date.now() - 19 * JOUR).toISOString(),
        dateRetourEffective: new Date(Date.now() - 17 * JOUR).toISOString(),
      },
    ]
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre d'exemplaires/)).toHaveValue(3)
    })

    const champ = screen.getByLabelText(/Nombre d'exemplaires/)
    await user.clear(champ)
    await user.type(champ, '1')
    await user.click(screen.getByRole('button', { name: 'Enregistrer les modifications' }))

    await waitFor(() => {
      expect(
        screen.getByText("Saisis au moins 2 exemplaires — l'historique des prêts est conservé"),
      ).toBeDefined()
    })
    expect(mockModifierLivre).not.toHaveBeenCalled()
    expect(mockSupprimerExemplaire).not.toHaveBeenCalled()
  })

  it('propose la suppression sur sa propre page', async () => {
    rendre()

    await waitFor(() => {
      expect(screen.getByLabelText('Titre')).toHaveValue('Le Petit Prince')
    })

    const lien = screen.getByRole('link', { name: 'Supprimer ce livre' })
    expect(lien.getAttribute('href')).toBe('/profs/bibliotheque/livres/100/supprimer')
    // Rouge : l'action est destructive, pas une action à encourager.
    expect(lien).toHaveClass('lpv-a-button--danger')
  })

  it('affiche l etat livre introuvable', () => {
    catalogueRetour.data = []
    rendre()

    expect(screen.getByText('Livre introuvable ou retiré du catalogue.')).toBeDefined()
  })
})