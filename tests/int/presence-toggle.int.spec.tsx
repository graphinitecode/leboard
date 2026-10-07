import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'

import type { SeanceDetail, StatutPresence } from '@/seances'

// Base simulée : le statut enregistré, et un rechargement de la séance qu'on
// libère à la main pour observer l'écran entre enregistrement et refetch.
let statutEnBase: StatutPresence = 'present'
let rechargementsBloques = false
let libererRechargement: () => void = () => undefined
const enregistrer = vi.fn(async (statut: StatutPresence) => {
  statutEnBase = statut
})

const detail = (): SeanceDetail => ({
  seance: {
    id: 12,
    date: '2026-09-18T15:00:00.000Z',
    matiere: 'maths',
    groupeIds: [1],
    profId: 7,
    duree: 60,
    profLabel: null,
    retourTexte: '',
    aRetour: false,
    serie: null,
  },
  presences: [{ id: 11, seanceId: 12, eleveId: 1, present: statutEnBase }],
  elevesDuGroupe: [{ id: 1, prenom: 'Lucas', nom: 'Martin' }],
})

vi.mock('@/seances/infrastructure/seances.repository', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('@/seances/infrastructure/seances.repository')
  >()
  return {
    ...original,
    seancesRepository: {
      ...original.seancesRepository,
      getDetail: () =>
        rechargementsBloques
          ? new Promise<SeanceDetail>((resolve) => {
              libererRechargement = () => resolve(detail())
            })
          : Promise.resolve(detail()),
      togglePresence: ({ statut }: { statut: StatutPresence }) => enregistrer(statut),
    },
  }
})

import ModifierSeanceView from '@/app/(frontend)/profs/seances/[id]/modifier/ModifierSeanceView'

const statutActif = () =>
  screen.getAllByRole('button').find((bouton) => bouton.getAttribute('aria-pressed') === 'true')
    ?.textContent

describe('PresenceToggle — complétion de séance', () => {
  it("garde le statut choisi affiché jusqu'au rechargement (pas de retour en arrière)", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <ModifierSeanceView seanceId={12} />
      </QueryClientProvider>,
    )
    await waitFor(() => expect(statutActif()).toBe('Présent'))

    rechargementsBloques = true
    await userEvent.click(screen.getByRole('button', { name: 'Absent' }))

    // Enregistrement terminé, rechargement encore en cours : l'écran ne doit
    // pas revenir sur « Présent ».
    await waitFor(() => expect(enregistrer).toHaveBeenCalledWith('absent'))
    expect(statutActif()).toBe('Absent')

    await act(async () => libererRechargement())
    expect(statutActif()).toBe('Absent')
  })
})
