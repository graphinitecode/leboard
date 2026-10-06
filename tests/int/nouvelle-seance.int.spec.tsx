import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NouvelleSeanceView, { initialiserDepuisParams } from '@/app/(frontend)/profs/seances/nouvelle/NouvelleSeanceView'

const creerSeance = vi.fn(async () => null)
const creerSerie = vi.fn(async () => undefined)

// Mardi 6 octobre 2026, 14h → 15h (préremplissage depuis le calendrier)
const parametres = { valeur: 'date=2026-10-06&debut=14:00&fin=15:00' }
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(parametres.valeur),
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
    parametres.valeur = 'date=2026-10-06&debut=14:00&fin=15:00'
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

describe('NouvelleSeanceView (choix de la semaine)', () => {
  beforeEach(() => {
    // Mardi 6 octobre 2026
    vi.useFakeTimers({ now: new Date(2026, 9, 6, 9), shouldAdvanceTime: true, toFake: ['Date'] })
    creerSeance.mockClear()
    parametres.valeur = 'debut=14:00&fin=15:00'
  })

  it('navigue vers les semaines suivantes et crée la séance au jour choisi', async () => {
    const user = userEvent.setup()
    render(<NouvelleSeanceView />)

    expect(screen.getByText('Semaine du 5 au 11 octobre')).toBeDefined()
    // Pas de retour avant la semaine courante, lundi déjà passé
    expect(screen.getByRole('button', { name: 'Semaine précédente' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Lundi 5' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }))
    await user.click(screen.getByRole('button', { name: 'Semaine suivante' }))
    expect(screen.getByText('Semaine du 19 au 25 octobre')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Jeudi 22' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Maths' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.type(screen.getByRole('combobox', { name: 'Élèves' }), 'lucas')
    await user.click(screen.getByText('Lucas Martin'))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(screen.getByText('Jeudi 22 octobre')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Créer la séance' }))
    await user.click(screen.getAllByRole('button', { name: 'Créer la séance' }).at(-1) as HTMLElement)
    expect(creerSeance).toHaveBeenCalledTimes(1)
    const debut = (creerSeance.mock.calls[0] as unknown as [{ debut: Date }])[0].debut
    expect(debut.getFullYear()).toBe(2026)
    expect(debut.getMonth()).toBe(9)
    expect(debut.getDate()).toBe(22)
    expect(debut.getHours()).toBe(14)
  })
})

describe('initialiserDepuisParams', () => {
  const maintenant = new Date(2026, 9, 6, 9)

  it('ouvre la semaine de la date reçue, même lointaine', () => {
    const initial = initialiserDepuisParams(new URLSearchParams('date=2026-11-19&debut=10:00'), maintenant)
    expect(initial.lundi).toEqual(new Date(2026, 10, 16))
    expect(initial.jourIndex).toBe(3)
    expect(initial.heureDebut).toBe('10:00')
  })

  it('une date passée ou absente retombe sur le premier jour disponible de la semaine courante', () => {
    expect(initialiserDepuisParams(new URLSearchParams('date=2026-09-01'), maintenant)).toMatchObject({
      jourIndex: 1,
      lundi: new Date(2026, 9, 5),
    })
    expect(initialiserDepuisParams(new URLSearchParams(''), maintenant)).toMatchObject({
      jourIndex: 1,
      lundi: new Date(2026, 9, 5),
    })
  })
})
