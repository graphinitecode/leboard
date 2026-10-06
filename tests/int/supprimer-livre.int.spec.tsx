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
const mockRetirerCatalogue = vi.fn()

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
    useRetirerCatalogue: () => ({
      isPending: false,
      mutateAsync: mockRetirerCatalogue,
    }),
  }
})

import SupprimerLivreView from '@/app/(frontend)/profs/bibliotheque/livres/[id]/supprimer/SupprimerLivreView'

const LIVRE: LivreCatalogue = {
  id: 100,
  titre: 'Le Petit Prince',
  auteur: 'Antoine de Saint-Exupéry',
  isbn: '9782070408504',
  resume: null,
  editeur: null,
  niveau: 'primaire',
  categorie: 'lecture',
  archived: false,
  createdAt: '2024-09-15T00:00:00.000Z',
  exemplaires: [{ id: 1, code: 'LPV-0001', etat: 'bon', disponible: false }],
}

const JOUR = 86_400_000

const PRET_EN_COURS: Pret = {
  id: 1,
  eleveId: 10,
  eleveLabel: 'Lucas Martin',
  exemplaireCode: 'LPV-0001',
  livreId: 12,
  livreLabel: 'Le Petit Prince',
  dateEmprunt: new Date(Date.now() - 5 * JOUR).toISOString(),
  dateRetourPrevue: new Date(Date.now() + 16 * JOUR).toISOString(),
  dateRetourEffective: null,
}

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <SupprimerLivreView livreId={100} />
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
  mockRetirerCatalogue.mockReset().mockResolvedValue(undefined)
})

describe('SupprimerLivreView (page dédiée, pattern GOV.UK)', () => {
  it('pose la question avec le titre du livre et retourne vers la fiche', () => {
    rendre()

    expect(screen.getByText('Supprimer « Le Petit Prince » ?')).toBeDefined()
    expect(screen.getByRole('link', { name: 'Retour à la fiche du livre' })).toBeDefined()
  })

  it('explique les conséquences : historique conserve, sortie du catalogue', () => {
    rendre()

    expect(
      screen.getByText(/Cette action est définitive\..*L'historique des emprunts de ce livre sera conservé, mais il n'apparaîtra plus dans le catalogue\./),
    ).toBeDefined()
  })

  it('avertit qu un prêt en cours n est pas annulé, avec l élève et la date', () => {
    pretsLivreRetour.data = [PRET_EN_COURS]
    rendre()

    expect(
      screen.getByText(/Un exemplaire est actuellement emprunté par Lucas Martin, retour prévu le \d{1,2} [a-zé.]+\. La suppression n'annule pas ce prêt en cours\./),
    ).toBeDefined()
  })

  it('signale le retard du prêt en cours', () => {
    pretsLivreRetour.data = [
      { ...PRET_EN_COURS, dateRetourPrevue: new Date(Date.now() - 8 * JOUR).toISOString() },
    ]
    rendre()

    expect(
      screen.getByText(/Un exemplaire est actuellement emprunté par Lucas Martin, retour prévu le \d{1,2} [a-zé.]+ \(en retard\)\. La suppression n'annule pas ce prêt en cours\./),
    ).toBeDefined()
  })

  it('n affiche pas l encart préts quand aucun exemplaire n est dehors', () => {
    rendre()

    expect(screen.queryByText(/Un exemplaire est actuellement emprunté/)).toBeNull()
  })

  it('supprime le livre au clic — bouton rouge, annulation neutre non verte', async () => {
    const user = userEvent.setup()
    rendre()

    const supprimer = screen.getByRole('button', { name: 'Oui, supprimer ce livre' })
    // Le bouton d'annulation est un lien neutre (secondaire) — pas un bouton vert.
    const annuler = screen.getByRole('link', { name: 'Annuler' })

    // Ni l'un ni l'autre vert : rouge pour la suppression, neutre pour l'annulation.
    expect(supprimer).toHaveClass('lpv-a-button--danger')
    expect(annuler).toHaveClass('lpv-a-button--secondary')

    await user.click(supprimer)

    await waitFor(() => {
      expect(mockRetirerCatalogue).toHaveBeenCalledTimes(1)
      expect(mockRetirerCatalogue).toHaveBeenCalledWith({ id: 100 })
      expect(screen.getByText('Livre supprimé')).toBeDefined()
      expect(
        screen.getByText(/« Le Petit Prince » n'est plus au catalogue\./),
      ).toBeDefined()
    })
  })

  it('annulation : aucune suppression', () => {
    rendre()

    const annuler = screen.getByRole('link', { name: 'Annuler' })
    expect(annuler.getAttribute('href')).toBe('/profs/bibliotheque/livres/100')
    // L'annulation est une navigation — rien n'est supprimé sans clic sur le
    // bouton rouge.
    expect(mockRetirerCatalogue).not.toHaveBeenCalled()
    expect(screen.getByText('Supprimer « Le Petit Prince » ?')).toBeDefined()
  })

  it('montre l erreur dans le résumé si la suppression échoue', async () => {
    const user = userEvent.setup()
    mockRetirerCatalogue.mockRejectedValueOnce(new Error('Accès refusé.'))
    rendre()

    await user.click(screen.getByRole('button', { name: 'Oui, supprimer ce livre' }))

    await waitFor(() => {
      expect(screen.getByText('Il y a 1 problème')).toBeDefined()
      expect(screen.getByText('Accès refusé.')).toBeDefined()
    })
  })

  it('affiche l état livre introuvable', () => {
    catalogueRetour.data = []
    rendre()

    expect(screen.getByText('Livre introuvable ou retiré du catalogue.')).toBeDefined()
  })
})