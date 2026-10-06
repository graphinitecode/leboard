import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NouvelleSeanceView from '@/app/(frontend)/profs/seances/nouvelle/NouvelleSeanceView'

const creerSeance = vi.fn(async () => null)
const creerSerie = vi.fn(async () => undefined)

// Mardi 6 octobre 2026, 14h → 15h (préremplissage depuis le calendrier)
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('date=2026-10-06&debut=14:00&fin=15:00'),
}))

vi.mock('@/calendrier', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/calendrier')>()),
  useCreerSeance: () => ({ mutateAsync: creerSeance }),
  useCreerSerie: () => ({ mutateAsync: creerSerie }),
  useElevesDuProf: () => ({
    data: [{ id: 3, niveau: 'CM2', nom: 'Martin', prenom: 'Lucas' }],
    isLoading: false,
  }),
  useSeancesPeriode: () => ({ data: [], isLoading: false }),
}))

type Utilisateur = ReturnType<typeof userEvent.setup>

// Jour, début, fin (préremplis), matière, élève
async function jusquAuxEleves(user: Utilisateur) {
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await user.click(screen.getByRole('button', { name: 'Maths' }))
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await user.type(screen.getByRole('combobox', { name: 'Élèves' }), 'lucas')
  await user.click(screen.getByText('Lucas Martin'))
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
}

describe('NouvelleSeanceView (répétition)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 9, 6, 9), shouldAdvanceTime: true, toFake: ['Date'] })
    creerSeance.mockClear()
    creerSerie.mockClear()
  })

  it('une seule fois : crée une séance ponctuelle', async () => {
    const user = userEvent.setup()
    render(<NouvelleSeanceView />)
    await jusquAuxEleves(user)

    expect(screen.getByRole('heading', { name: 'Cette séance se répète-t-elle ?' })).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Une seule fois')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Créer la séance' }))
    await user.click(screen.getAllByRole('button', { name: 'Créer la séance' }).at(-1) as HTMLElement)
    expect(creerSeance).toHaveBeenCalledTimes(1)
    expect(creerSerie).not.toHaveBeenCalled()
  })

  it('chaque semaine jusqu’à une date : crée une série', async () => {
    const user = userEvent.setup()
    render(<NouvelleSeanceView />)
    await jusquAuxEleves(user)

    expect(screen.getByText('Chaque mois le 1er mardi')).toBeDefined()
    await user.click(screen.getByLabelText('Chaque semaine'))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByRole('heading', { name: 'Jusqu’à quand se répète-t-elle ?' })).toBeDefined()
    await user.click(screen.getByLabelText('Jusqu’à une date'))
    // Continuer reste bloqué tant que la date manque
    expect(screen.getByRole('button', { name: 'Continuer' })).toHaveProperty('disabled', true)
    await user.type(screen.getByLabelText('Dernier jour'), '2026-12-15')
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByText('Chaque semaine le mardi, jusqu’au 15 décembre 2026')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Créer les séances' }))
    await user.click(screen.getAllByRole('button', { name: 'Créer les séances' }).at(-1) as HTMLElement)

    expect(creerSerie).toHaveBeenCalledWith({
      dureeMin: 60,
      eleveIds: [3],
      fin: '2026-12-15',
      frequence: 'hebdomadaire',
      heureDebut: '14:00',
      matiere: 'maths',
      premiere: '2026-10-06',
    })
    expect(creerSeance).not.toHaveBeenCalled()
    expect(await screen.findByText('Vos séances sont enregistrées')).toBeDefined()
  })
})
