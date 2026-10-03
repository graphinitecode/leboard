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

  it('rend le nom de l eleve emprunteur cliquable vers sa fiche', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre()

    const lienEleve = container.querySelector<HTMLAnchorElement>(
      'a[href="/profs/eleves/10?retour=/profs/bibliotheque/livres/100"]',
    )
    expect(lienEleve).not.toBeNull()
    expect(lienEleve?.textContent).toContain('Lucas Martin')
    expect(lienEleve?.className).toContain('lpv-link-inline')
    // Historique complet : les deux élèves sont des liens
    expect(
      container.querySelector<HTMLAnchorElement>(
        'a[href="/profs/eleves/11?retour=/profs/bibliotheque/livres/100"]',
      ),
    ).not.toBeNull()
  })

  it('affiche la sidebar actions retard et informations pour un gerant', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre()

    expect(container.textContent).toContain('Faites état du prêt')
    expect(container.textContent).toContain('Retard en cours')
    expect(container.textContent).toContain('Informations')
    expect(container.textContent).toContain('978-2-07-040850-4')
    expect(container.textContent).toContain('Exemplaires')
    expect(container.textContent).toContain('Ajouté au catalogue')
    expect(screen.getByText('Modifier la fiche du livre')).toBeDefined()

    // Note « gestion des exemplaires » dans la carte Informations (carte colorée)
    const cardInfo = Array.from(
      container.querySelectorAll('.lpv-t-dashboard-page__aside-color-card'),
    ).find((card) => card.querySelector('h3')?.textContent === 'Informations')
    expect(cardInfo?.textContent).toContain(
      "notes d'entretien) se gèrent dans le panneau d'administration",
    )
    expect(cardInfo?.querySelector('a[href="/admin"]')).not.toBeNull()
  })

  it('masque les actions pour un prof (lecture seule)', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre(false)

    expect(container.textContent).not.toContain('Faites état du prêt')
    expect(screen.queryByText('Modifier la fiche du livre')).toBeNull()
    expect(container.textContent).toContain('Informations')
  })

  it('masque la note gestion des exemplaires pour un non gerant', () => {
    pretsLivreRetour.data = PRETS
    const { container } = rendre(false)

    expect(container.textContent).not.toContain("notes d'entretien")
  })

  it('affiche l etat livre introuvable', () => {
    catalogueRetour.data = []
    rendre()

    expect(screen.getByText('Livre introuvable ou retiré du catalogue.')).toBeDefined()
  })

  it('affiche un lien ajouter resume pour un gerant quand le resume manque', () => {
    catalogueRetour.data = [{ ...LIVRE, resume: null }]
    const { container } = rendre()

    expect(container.textContent).toContain("Ce livre n'a pas encore de résumé.")
    const lien = container.querySelector<HTMLAnchorElement>(
      'a[href="/profs/bibliotheque/livres/100/modifier#livre-resume"]',
    )
    expect(lien).not.toBeNull()
    expect(lien?.textContent).toBe('Ajouter un résumé')
    expect(lien?.className).toContain('lpv-link-inline')
  })

  it('masque le lien ajouter resume pour un non gerant', () => {
    catalogueRetour.data = [{ ...LIVRE, resume: null }]
    const { container } = rendre(false)

    expect(container.textContent).toContain("Ce livre n'a pas encore de résumé.")
    expect(container.querySelector('a[href*="#livre-resume"]')).toBeNull()
  })

  it('masque le message et le lien quand le resume existe', () => {
    rendre()

    expect(screen.queryByText(/pas encore de résumé/)).toBeNull()
    expect(screen.queryByText('Ajouter un résumé')).toBeNull()
    expect(screen.getByText(/Un aviateur rencontre un petit garçon/)).toBeDefined()
  })

  it('demande le mot de passe avant de marquer un retour', async () => {
    pretsLivreRetour.data = PRETS
    const user = userEvent.setup()
    rendre()

    await user.click(screen.getByRole('button', { name: 'Signaler un retour' }))

    expect(screen.getByText('Marquer le retour du prêt ?')).toBeDefined()
    const champ = screen.getByLabelText('Mot de passe du compte connecté')
    const confirmer = screen.getByRole('button', { name: 'Confirmer le retour' })
    expect((confirmer as HTMLButtonElement).disabled).toBe(true)

    await user.type(champ, 'secret')
    await user.click(confirmer)

    await waitFor(() => {
      expect(mockMarquerRetourne).toHaveBeenCalledWith({ motDePasse: 'secret', pretId: 1 })
    })
  })
})