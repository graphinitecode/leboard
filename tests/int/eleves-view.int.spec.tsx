import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Eleve } from '@/students'

const hookRetour: { data?: Eleve[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}

// Taux de présence par élève (mock du repo @/seances)
const presencesParEleve = new Map<number, { present: string }[]>()

vi.mock('@/students', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/students')>()
  return {
    ...original,
    useListElevesDuProf: () => hookRetour,
  }
})

vi.mock('@/seances', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/seances')>()
  return {
    ...original,
    seancesRepository: {
      ...original.seancesRepository,
      listPresencesParEleve: (eleveId: number) =>
        Promise.resolve((presencesParEleve.get(eleveId) ?? []) as never),
    },
  }
})

import ElevesView from '@/app/(frontend)/profs/eleves/ElevesView'

const elevesMock: Eleve[] = [
  { id: 1, prenom: 'Lucas', nom: 'Martin', niveau: 'CM2', groupe: 'CM2 - Groupe B' },
  { id: 2, prenom: 'Sarah', nom: 'Kaufmann', niveau: '6e', groupe: '6e - Groupe A' },
  { id: 3, prenom: 'Emma', nom: 'Roux', niveau: 'CM2', groupe: 'CM2 - Groupe B' },
]

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ElevesView alertes={[]} profId={1} />
    </QueryClientProvider>,
  )
}

const rendreAvecAlertes = (alertes: { id: string; eleveId: number; message: string }[]) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ElevesView alertes={alertes} profId={1} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  hookRetour.data = []
  hookRetour.isLoading = false
  hookRetour.isError = false
  presencesParEleve.clear()
})

describe('ElevesView (liste alignee maquette)', () => {
  it('affiche l etat vide quand aucun eleve', () => {
    const { container } = rendre()

    expect(container.textContent).toContain('Aucun élève')
  })

  it('affiche stats, searchbar et la table des eleves', async () => {
    hookRetour.data = elevesMock
    presencesParEleve.set(1, [
      { present: 'present' },
      { present: 'absent' },
      { present: 'absent' },
    ])
    presencesParEleve.set(3, [{ present: 'present' }, { present: 'present' }])

    const { container } = rendre()

    // Table GOV.UK après calcul des taux
    await screen.findByText('Tous mes élèves')
    await waitFor(() => {
      expect(container.querySelector('.lpv-m-table')).not.toBeNull()
    })

    // Stats maquette
    expect(container.textContent).toContain('Élèves suivis')
    expect(container.textContent).toContain('Présence moyenne')
    expect(container.textContent).toContain('Élèves à surveiller')

    // Searchbar à filtres
    expect(container.querySelector('.lpv-o-eleves__searchbar')).not.toBeNull()
    expect(screen.getByLabelText(/Filtrer par groupe/)).toBeDefined()
    expect(screen.getByLabelText(/Filtrer par statut/)).toBeDefined()

    // Contenu
    expect(container.textContent).toContain('Lucas')
    expect(container.textContent).toContain('CM2 - Groupe B')
    // Présence en % et tags statut
    expect(container.textContent).toContain('33%')
    expect(screen.getAllByText('À surveiller').length).toBeGreaterThan(0)
    expect(container.textContent).toContain('Régulier')
  })

  it('applique le seuil 75% et les alertes decrochage au statut', async () => {
    hookRetour.data = elevesMock
    presencesParEleve.set(1, [{ present: 'absent' }, { present: 'absent' }])
    presencesParEleve.set(2, [{ present: 'present' }, { present: 'present' }])

    rendreAvecAlertes([{ id: 'a1', eleveId: 1, message: '3 absences sur les 4 dernières séances' }])

    await screen.findByText('Tous mes élèves')

    // Lucas : alerte décrochage → À surveiller avec message dans la sidebar
    expect(screen.getByText('3 absences sur les 4 dernières séances')).toBeDefined()
    const linksFiche = screen.getAllByText('Voir la fiche')
    expect(linksFiche.length).toBeGreaterThan(0)
  })

  it('filtre par groupe', async () => {
    hookRetour.data = elevesMock
    const user = userEvent.setup()
    const { container } = rendre()

    await screen.findByText('Tous mes élèves')

    await user.selectOptions(screen.getByLabelText(/Filtrer par groupe/), '6e - Groupe A')

    await waitFor(() => {
      expect(container.textContent).not.toContain('Lucas')
      expect(container.textContent).toContain('Sarah')
    })
  })

  it('pagine par tranches de 5', async () => {
    hookRetour.data = [
      ...Array.from({ length: 7 }, (_, i) => ({
        id: i + 10,
        prenom: `Eleve${i + 1}`,
        nom: 'Test',
        niveau: 'CM2' as const,
        groupe: null,
      })),
    ]
    const user = userEvent.setup()
    const { container } = rendre()

    await screen.findByText('Tous mes élèves')
    await waitFor(() => {
      expect(container.querySelector('.lpv-m-table')).not.toBeNull()
    })

    expect(container.textContent).toContain('5 sur 7 élèves')

    await user.click(screen.getByRole('button', { name: 'Afficher les suivants' }))

    await waitFor(() => {
      expect(container.textContent).toContain('7 sur 7 élèves')
    })
  })

  it('affiche le message d erreur en cas d echec de chargement', () => {
    hookRetour.isError = true
    rendre()

    expect(screen.getByText(/Impossible de charger vos élèves/)).toBeDefined()
  })
})