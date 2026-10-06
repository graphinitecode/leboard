import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SeanceDetail } from '@/seances'
import type { Progression } from '@/progressions'

// Hooks module : useGetSeance et useListProgressionsParSeance mockés, le
// reste (presenter, organismes) original.
const retourGetSeance: { data: SeanceDetail | null; isLoading: boolean } = {
  data: null,
  isLoading: false,
}
const retourProgressions: { data: Progression[] } = { data: [] }

vi.mock('@/seances', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/seances')>()
  return {
    ...original,
    useGetSeance: () => retourGetSeance,
  }
})

vi.mock('@/progressions', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/progressions')>()
  return {
    ...original,
    useListProgressionsParSeance: () => retourProgressions,
  }
})

import SeanceProfView from '@/app/(frontend)/profs/seances/[id]/SeanceProfView'

const seanceDetail: SeanceDetail = {
  seance: {
    id: 12,
    date: '2026-09-18T15:00:00.000Z',
    matiere: 'maths',
    groupeIds: [1, 2],
    profId: 7,
    duree: 60,
    profLabel: 'Claire D.',
    retourTexte: 'Bonne séance sur les fractions.',
    aRetour: true,
    serie: null,
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

const progressionsSeance: Progression[] = [
  {
    id: 5,
    eleveId: 1,
    eleveNom: 'Lucas Martin',
    competenceId: 3,
    competenceLabel: 'Fractions',
    niveau: 'a-revoir',
    date: '2026-09-18T15:30:00.000Z',
    commentaire: 'Confond numérateur et dénominateur.',
  },
]

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <SeanceProfView seanceId={12} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  retourGetSeance.data = seanceDetail
  retourGetSeance.isLoading = false
  retourProgressions.data = progressionsSeance
})

describe('SeanceProfView', () => {
  it('commence par le retour de séance, puis les onglets présences/notes', () => {
    const { container } = rendre()

    // Ordre des sections : retour de séance AVANT le tableau de suivi
    const titresH2 = Array.from(container.querySelectorAll('h2'))
    expect(titresH2.some((h2) => h2.textContent === 'Retour de séance')).toBe(true)
    expect(titresH2.some((h2) => h2.textContent === 'Suivi de la séance')).toBe(true)
    expect(titresH2.findIndex((h2) => h2.textContent === 'Retour de séance')).toBeLessThan(
      titresH2.findIndex((h2) => h2.textContent === 'Suivi de la séance'),
    )

    // Onglets avec compteurs, onglet Présences actif par défaut
    const ongletPresences = screen.getByRole('tab', { name: 'Présences (2)' })
    const ongletNotes = screen.getByRole('tab', { name: 'Notes de progression (1)' })
    expect(ongletPresences).toHaveAttribute('aria-selected', 'true')
    expect(ongletNotes).toHaveAttribute('aria-selected', 'false')
  })

  it('bascule entre Présences (tags) et Notes de progression', async () => {
    const { container } = rendre()

    // Onglet 1 : tableau des présences, statut en tag (pas de toggle)
    expect(container.querySelector('.lpv-m-table')).not.toBeNull()
    // Colonne d'ordre : numéro en tête de chaque ligne (comptage facile)
    const numeros = Array.from(
      container.querySelectorAll('.lpv-m-table__body th[scope="row"]'),
    ).map((cellule) => cellule.textContent)
    expect(numeros).toEqual(['1', '2'])
    expect(container.querySelector('.lpv-m-table .lpv-a-tag--green')).not.toBeNull()
    expect(container.querySelector('.lpv-m-table .lpv-a-tag--red')).not.toBeNull()
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.getAllByText('Lucas Martin').length).toBeGreaterThan(0)

    // Clic sur l'onglet Notes : sélection + cartes de progression visibles
    await userEvent.click(screen.getByRole('tab', { name: 'Notes de progression (1)' }))
    expect(screen.getByRole('tab', { name: 'Notes de progression (1)' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText(/Fractions : À revoir/)).toBeDefined()
    expect(screen.getByText('Confond numérateur et dénominateur.')).toBeDefined()
    expect(screen.getByText('Ajouter une progression')).toBeDefined()
  })

  it('affiche le retour en lecture seule avec un lien vers la page de complétion', () => {
    const { container } = rendre()

    // Retour affiché dans un encart (InsetText), sans champ d'édition inline
    expect(container.querySelector('.lpv-a-inset')?.textContent).toContain('Bonne séance sur les fractions.')
    expect(screen.queryByRole('textbox')).toBeNull()

    // Carte Informations : variante verte (séance complète)
    expect(
      container.querySelector('.lpv-t-dashboard-page__aside-color-card--complete'),
    ).not.toBeNull()

    // Sidebar : le bouton « Modifier cette séance » devient un lien vers la
    // page entière de complétion (retour + présences)
    expect(screen.getByText('Modifier cette séance')).toBeDefined()
    const lienEdition = screen.getByText('Modifier le retour').closest('a')
    expect(lienEdition?.getAttribute('href')).toBe('/profs/seances/12/modifier')
    expect(container.textContent).toContain('Retour complété')

    // Stats et carte absents toujours présentes
    expect(screen.getByText('1 / 2')).toBeDefined()
    expect(screen.getByText('Élèves présents')).toBeDefined()
    expect(screen.getByText('Notes de progression ajoutées')).toBeDefined()
    expect(screen.getByText('Élèves absents')).toBeDefined()
    expect(screen.getByText('Voir sa fiche')).toBeDefined()
  })

  it('retour vide : EmptyState + bouton « Compléter » ; notes vides : EmptyState avec bouton d’ajout', async () => {
    retourGetSeance.data = {
      ...seanceDetail,
      seance: { ...seanceDetail.seance, retourTexte: '', aRetour: false },
    }
    retourProgressions.data = []
    const { container } = rendre()

    // Retour vide : état vide en lecture + bouton « Compléter » en sidebar
    expect(screen.getByText('Aucun retour')).toBeDefined()
    expect(screen.getByText('Compléter le retour')).toBeDefined()
    expect(container.textContent).toContain('Retour en attente')
    // Carte Informations en variante orange (séance incomplète)
    expect(container.querySelector('.lpv-t-dashboard-page__aside-color-card--pending'))
      .not.toBeNull()

    // Onglet notes : EmptyState portant le bouton d'ajout
    await userEvent.click(screen.getByRole('tab', { name: 'Notes de progression (0)' }))
    const bouton = screen.getByRole('button', { name: 'Ajouter une progression' })
    expect(bouton.closest('.lpv-m-empty-state')).not.toBeNull()

    // Clic : le formulaire de progression s'ouvre
    await userEvent.click(bouton)
    expect(screen.getByText('Compétence')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Enregistrer' })).toBeDefined()
  })

  it("rend l'état vide (séance introuvable)", () => {
    retourGetSeance.data = null
    rendre()
    expect(screen.getByText('Séance introuvable ou accès refusé')).toBeDefined()
  })
})