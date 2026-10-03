import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SeanceDetail } from '@/seances'

type TogglePresenceCommand = {
  presenceId: number
  seanceId?: number
  statut: 'present' | 'absent' | 'absent-justifie'
}

// Hooks module : useGetSeance mocké, repository de commandes mocké pour
// tester le flux réel des toggles et du retour, reste original.
const retourGetSeance: { data: SeanceDetail | null; isLoading: boolean } = {
  data: null,
  isLoading: false,
}

const togglePresenceMock = vi.fn(
  (_command: {
    presenceId: number
    seanceId?: number
    statut: 'present' | 'absent' | 'absent-justifie'
  }) => Promise.resolve(),
)
const enregistrerRetourMock = vi.fn((_command: { seanceId: number; retour: string }) =>
  Promise.resolve(),
)

vi.mock('@/seances', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/seances')>()
  return {
    ...original,
    useGetSeance: () => retourGetSeance,
  }
})

// Les handlers importent le repository directement depuis son chemin
// infrastructure : mocker ce module intercepte tous les flux (hooks,
// handlers, barrel).
vi.mock('@/seances/infrastructure/seances.repository', async (importOriginal) => {
  const original = await importOriginal<
    typeof import('@/seances/infrastructure/seances.repository')
  >()
  return {
    ...original,
    seancesRepository: {
      ...original.seancesRepository,
      // Déréférencement paresseux : le factory vi.mock s'exécute au moment
      // de l'import, avant l'initialisation des const du module.
      togglePresence: (command: TogglePresenceCommand) => togglePresenceMock(command),
      enregistrerRetour: (command: { seanceId: number; retour: string }) =>
        enregistrerRetourMock(command),
    },
  }
})

import ModifierSeanceView from '@/app/(frontend)/profs/seances/[id]/modifier/ModifierSeanceView'

const seanceDetail: SeanceDetail = {
  seance: {
    id: 12,
    date: '2026-09-18T15:00:00.000Z',
    matiere: 'maths',
    groupeIds: [1, 2],
    profId: 7,
    duree: 60,
    profLabel: 'Claire D.',
    retourTexte: '',
    aRetour: false,
  },
  presences: [
    { id: 11, seanceId: 12, eleveId: 1, present: 'present' },
    { id: 12, seanceId: 12, eleveId: 2, present: 'absent' },
  ],
  elevesDuGroupe: [
    { id: 1, prenom: 'Lucas', nom: 'Martin', groupe: 'Groupe B', niveau: 'CM2' },
    { id: 2, prenom: 'Emma', nom: 'Roux', groupe: 'Groupe B', niveau: 'CM2' },
  ],
}

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ModifierSeanceView seanceId={12} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  retourGetSeance.data = seanceDetail
  retourGetSeance.isLoading = false
})

describe('ModifierSeanceView', () => {
  it('titre dynamique selon l’état du retour et back link vers la fiche', () => {
    const { container } = rendre()

    // Séance sans retour : « Compléter la séance »
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Compléter la séance')
    expect(screen.getByText('Retour à la séance')).toBeDefined()
    expect(
      container.querySelector('.lpv-a-back-link')?.getAttribute('href'),
    ).toBe('/profs/seances/12')

    // Deux onglets : Présences (compteur) et Retour de séance, présences actif
    const ongletPresences = screen.getByRole('tab', { name: 'Présences (2)' })
    expect(screen.getByRole('tab', { name: 'Retour de séance' })).toBeDefined()
    expect(ongletPresences).toHaveAttribute('aria-selected', 'true')

    // Onglet Présences : toggles (groupes boutons) + rangées élèves
    expect(screen.getAllByRole('group')).toHaveLength(2)
    expect(container.querySelectorAll('.lpv-o-seance-modifier .lpv-m-list-row')).toHaveLength(2)
    expect(screen.getByText('Lucas Martin')).toBeDefined()
    expect(screen.getByText('Emma Roux')).toBeDefined()

    // Onglet Retour : formulaire (textarea en DOM)
    expect(screen.getByRole('textbox')).toBeDefined()
  })

  it('« Modifier la séance » quand le retour existe déjà', () => {
    retourGetSeance.data = {
      ...seanceDetail,
      seance: { ...seanceDetail.seance, retourTexte: 'Bonne séance.', aRetour: true },
    }
    rendre()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Modifier la séance')
  })

  it('bascule une présence via le toggle et appelle le repository avec la séance', async () => {
    rendre()

    // Onglet Présences actif au départ
    await userEvent.click(screen.getByRole('tab', { name: 'Présences (2)' }))

    // Emma Roux est absente : clic sur « Présent » → togglePresence
    const groupeEmma = screen.getAllByRole('group')[1] as HTMLElement
    await userEvent.click(
      groupeEmma.querySelector('button[aria-label="Présent"]') as HTMLElement,
    )
    expect(togglePresenceMock).toHaveBeenCalledWith({
      presenceId: 12,
      seanceId: 12,
      statut: 'present',
    })
  })

  it('enregistre le retour après confirmation et affiche le succès', async () => {
    rendre()

    // Onglet « Retour de séance » puis saisie et confirmation (modal ConfirmAction)
    await userEvent.click(screen.getByRole('tab', { name: 'Retour de séance' }))
    await userEvent.type(screen.getByRole('textbox'), 'Bon travail sur les fractions.')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer le retour' }))
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    await vi.waitFor(() => expect(enregistrerRetourMock).toHaveBeenCalled())

    expect(enregistrerRetourMock).toHaveBeenCalledWith({
      retour: 'Bon travail sur les fractions.',
      seanceId: 12,
    })
    expect(await screen.findByText('Retour enregistré')).toBeDefined()
  })
})