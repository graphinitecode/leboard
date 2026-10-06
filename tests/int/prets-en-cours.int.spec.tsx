import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Pret } from '@/bibliotheque'

const mockMarquerRetourne = vi.fn().mockResolvedValue(undefined)
const jour = 86_400_000

const pret = (id: number, livre: string, eleve: string, retourDans: number, rendu = false): Pret => ({
  dateEmprunt: new Date(Date.now() - 20 * jour).toISOString(),
  dateRetourEffective: rendu ? new Date().toISOString() : null,
  dateRetourPrevue: new Date(Date.now() + retourDans * jour).toISOString(),
  eleveId: id,
  eleveLabel: eleve,
  exemplaireCode: `LPV-000${id}`,
  id,
  livreId: 12,
  livreLabel: livre,
})

const PRETS: Pret[] = [
  pret(1, 'Dans les temps', 'Emma Roux', 15),
  pret(2, 'Le Petit Prince', 'Lucas Martin', -8),
  pret(3, 'Matilda', 'Inès Diallo', 2),
  pret(4, 'Déjà rendu', 'Noé Petit', -3, true),
]

vi.mock('@/bibliotheque', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/bibliotheque')>()),
  useListTousPretsEnCours: () => ({ data: PRETS, isError: false, isLoading: false }),
  useMarquerRetourne: () => ({ isPending: false, mutateAsync: mockMarquerRetourne }),
}))

import PretsEnCoursView from '@/app/(frontend)/profs/bibliotheque/prets/PretsEnCoursView'

const lignes = () => screen.getAllByRole('row').slice(1)

describe('PretsEnCoursView', () => {
  beforeEach(() => mockMarquerRetourne.mockClear())

  it('liste les prêts en cours du plus urgent au plus lointain, avec leur statut', () => {
    render(<PretsEnCoursView peutGerer={false} />)

    expect(lignes().map((l) => within(l).getAllByRole('cell')[0].textContent)).toEqual([
      'Le Petit Prince · LPV-0002',
      'Matilda · LPV-0003',
      'Dans les temps · LPV-0001',
    ])
    expect(screen.getByText('En retard · 8 jours')).toBeDefined()
    expect(screen.getByText('À rendre sous 2 jours')).toBeDefined()
    expect(screen.getAllByText('Dans les temps').length).toBeGreaterThan(0)
    // Un prêt rendu n'apparaît pas ; un prof ne peut pas marquer le retour
    expect(screen.queryByText(/Déjà rendu/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Marquer comme retourné' })).toBeNull()
  })

  it('filtre par statut et par recherche', async () => {
    const user = userEvent.setup()
    render(<PretsEnCoursView peutGerer={false} />)

    await user.selectOptions(screen.getByLabelText('Filtrer par statut'), 'retard')
    expect(lignes()).toHaveLength(1)
    expect(screen.getByText('Lucas Martin')).toBeDefined()

    await user.selectOptions(screen.getByLabelText('Filtrer par statut'), '')
    await user.type(screen.getByLabelText('Rechercher un livre ou un élève'), 'inès')
    expect(lignes()).toHaveLength(1)
    expect(screen.getByText('Matilda')).toBeDefined()

    await user.type(screen.getByLabelText('Rechercher un livre ou un élève'), 'zzz')
    expect(screen.getByText('Aucun prêt ne correspond à ta recherche')).toBeDefined()
  })

  it('le retour en un clic demande le mot de passe puis clôture le prêt', async () => {
    const user = userEvent.setup()
    render(<PretsEnCoursView peutGerer />)

    await user.click(within(lignes()[0]).getByRole('button', { name: 'Marquer comme retourné' }))
    expect(screen.getByText('Marquer ce prêt comme retourné ?')).toBeDefined()
    await user.type(screen.getByLabelText('Mot de passe du compte connecté'), 'secret')
    await user.click(screen.getAllByRole('button', { name: 'Marquer comme retourné' }).at(-1) as HTMLElement)

    expect(mockMarquerRetourne).toHaveBeenCalledWith({ motDePasse: 'secret', pretId: 2 })
    expect(await screen.findByText('Prêt marqué comme retourné')).toBeDefined()
  })
})
