import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LivreCatalogue } from '@/bibliotheque'

const catalogueRetour: { data?: LivreCatalogue[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const searchParamsCourants = { params: new URLSearchParams() }
const mockCreer = vi.fn()
const mockCreerExemplaire = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => searchParamsCourants.params,
  usePathname: () => '/profs/bibliotheque/livres/import',
}))

vi.mock('@/bibliotheque', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/bibliotheque')>()
  return {
    ...original,
    useListCatalogue: () => catalogueRetour,
    useCreerLivre: () => ({ isPending: false, mutateAsync: mockCreer }),
    useCreerExemplaire: () => ({ isPending: false, mutateAsync: mockCreerExemplaire }),
  }
})

import ImportView from '@/app/(frontend)/profs/bibliotheque/livres/import/ImportView'

const CATALOGUE: LivreCatalogue[] = [
  {
    id: 100,
    titre: 'Le Petit Prince',
    auteur: 'A. de Saint-Exupéry',
    isbn: '9782070612758',
    resume: null,
    editeur: null,
    niveau: 'primaire',
    categorie: 'lecture',
    archived: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    exemplaires: [{ id: 1, code: 'LPV-0001', etat: 'bon', disponible: false }],
  },
]

// En-tête + 1 doublon catalogue + 27 lignes valides (dont n°3 « à préciser »,
// en tête d'aperçu) : 28 lignes lues, 27 importables, aperçu sur 2 pages.
const charger = (): string => {
  const enregistrements = [
    'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
    'Le Petit Prince;A. de Saint-Exupéry;9782070612758;CM1 – CM2;Lecture;1;',
  ]
  for (let n = 1; n <= 27; n += 1) {
    const categorie = n === 3 ? 'Roman classique' : 'Lecture'
    enregistrements.push(`Livre n°${n};Auteur Test ${n};;CM1 – CM2;${categorie};2;Un résumé de test ${n}`)
  }
  return enregistrements.join('\n')
}

const rendre = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <Suspense fallback={null}>
        <ImportView />
      </Suspense>
    </QueryClientProvider>,
  )
}

const chargerFichier = async (contenu: string) => {
  const user = userEvent.setup()
  await user.upload(
    screen.getByLabelText('Fichier CSV'),
    new File([contenu], 'livres.csv', { type: 'text/csv' }),
  )
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  return user
}

beforeEach(() => {
  searchParamsCourants.params = new URLSearchParams()
  catalogueRetour.data = []
  mockCreer.mockReset().mockResolvedValue(999)
  mockCreerExemplaire.mockReset().mockResolvedValue(undefined)
})

describe('ImportView', () => {
  it('affiche l ecran de selection du fichier', () => {
    rendre()

    expect(screen.getByRole('heading', { name: 'Importer des livres' })).toBeDefined()
    expect(screen.getByText(/Colonnes attendues/)).toBeDefined()
    expect(screen.getByLabelText('Fichier CSV')).toBeDefined()
  })

  it('rejette un fichier manquant puis vide', async () => {
    rendre()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Sélectionne un fichier CSV (export Excel ou Google Sheets).')).toBeDefined()

    await user.upload(
      screen.getByLabelText('Fichier CSV'),
      new File(['\n\n'], 'vide.csv', { type: 'text/csv' }),
    )
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Aucune ligne de données détectée dans le fichier.')).toBeDefined()
  })

  it('affiche la verification : compteurs, aperçu paginé, doublon pré-signalé', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    await chargerFichier(charger())

    expect(screen.getByText('Lignes lues')).toBeDefined()
    expect(screen.getByText('Prêtes à importer')).toBeDefined()
    expect(screen.getByText('À corriger')).toBeDefined()

    // Aperçu paginé : 28 lignes → 15 maximum par page
    expect(document.body.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toEqual(15)
    expect(screen.getByRole('button', { name: 'Importer les 27 livres' })).toBeDefined()

    // Filtres avec compteurs
    expect(screen.getByLabelText('Toutes (28)')).toBeDefined()
    expect(screen.getByLabelText('Prêtes (26)')).toBeDefined()
    expect(screen.getByLabelText('À préciser (1)')).toBeDefined()
    expect(screen.getByLabelText('Erreurs (1)')).toBeDefined()

    // Tout ce qui est importable est présélectionné ; le doublon (erreur) ne
    // l'est jamais.
    const caseDoublon = screen.getByLabelText(
      'Import impossible ligne 2 : déjà au catalogue',
    ) as HTMLInputElement
    expect(caseDoublon.disabled).toBe(true)
    expect(caseDoublon.checked).toBe(false)
    const caseN3 = screen.getByLabelText("Importer « Livre n°3 » (ligne 5)") as HTMLInputElement
    expect(caseN3.checked).toBe(true)

    // Doublon catalogue pré-signalé + ligne à préciser visible sur la page 1
    expect(screen.getByText(/déjà au catalogue/)).toBeDefined()
    expect(screen.getByText('À préciser')).toBeDefined()
    // Le message dédié « déjà au catalogue » est affiché (1 doublon), mais pas
    // le message « corrige ton fichier » (les autres erreurs : aucune).
    expect(screen.getByText(/n'est pas une erreur à corriger dans le fichier/)).toBeDefined()
    expect(screen.queryByText(/Les lignes en erreur ne seront pas importées/)).toBeNull()

    // Pagination : précédent absent en page 1, suivant présent
    expect(screen.queryByText('Précédent')).toBeNull()
    const suivant = screen.getByRole('link', { name: 'Page 2' }) as HTMLAnchorElement
    expect(suivant.getAttribute('href')).toEqual('/profs/bibliotheque/livres/import?page=2')
  })

  it('affiche la page 2 de l aperçu via le paramètre url', async () => {
    catalogueRetour.data = CATALOGUE
    const vue = rendre()
    await chargerFichier(charger())

    searchParamsCourants.params = new URLSearchParams('page=2')
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vue.rerender(
      <QueryClientProvider client={client}>
        <Suspense fallback={null}>
          <ImportView />
        </Suspense>
      </QueryClientProvider>,
    )

    // Suite : 28 - 15 = 13 lignes, précédent canonique, plus de suivant
    expect(document.body.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toEqual(13)
    expect(
      document.body.querySelector('.lpv-m-pagination__previous a[href="/profs/bibliotheque/livres/import"]'),
    ).not.toBeNull()
    expect(document.body.querySelector('a[href*="page=3"]')).toBeNull()
  })

  it('explique quand tout le fichier est deja au catalogue', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    await chargerFichier(
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume\n' +
        'Le Petit Prince;A. de Saint-Exupéry;9782070612758;CM1 – CM2;Lecture;1;',
    )

    expect(screen.getByText(/Tout ce fichier est déjà au catalogue/)).toBeDefined()
    const bouton = screen.getByRole('button', {
      name: 'Rien à importer — tout ce fichier est déjà au catalogue',
    }) as HTMLButtonElement
    expect(bouton.disabled).toBe(true)
    // Aucune case cochable : le doublon est bloquant
    expect((screen.getByLabelText('Import impossible ligne 2 : déjà au catalogue') as HTMLInputElement).disabled).toBe(true)
  })

  it('filtre les lignes par statut avec les boutons radio dédiés', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    const user = await chargerFichier(charger())

    await user.click(screen.getByLabelText('Erreurs (1)'))
    await waitFor(() => {
      expect(document.body.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toEqual(1)
    })
    // Une seule page d'erreur → pagination éteinte
    expect(document.body.querySelector('.lpv-m-pagination')).toBeNull()

    // Valeurs manquantes (niveau/catégorie non reconnu) : la ligne n°3
    await user.click(screen.getByLabelText('À préciser (1)'))
    await waitFor(() => {
      expect(screen.getByText('Livre n°3')).toBeDefined()
    })
    expect(screen.getByRole('button', { name: 'Importer les 27 livres' })).toBeDefined()

    // Retour complet
    await user.click(screen.getByLabelText('Toutes (28)'))
    expect(document.body.querySelectorAll('.lpv-m-table tbody .lpv-m-table__row').length).toEqual(15)
  })

  it('importe uniquement les lignes sélectionnées', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    const user = await chargerFichier(charger())

    await user.click(screen.getByLabelText("Importer « Livre n°3 » (ligne 5)"))
    await user.click(screen.getByLabelText("Importer « Livre n°1 » (ligne 3)"))
    expect(screen.getByRole('button', { name: 'Importer les 25 livres' })).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Importer les 25 livres' }))
    await waitFor(() => {
      expect(screen.getByText('Import terminé')).toBeDefined()
    }, { timeout: 5000 })
    expect(screen.getByText(/25 livres ajoutés au catalogue/)).toBeDefined()

    const titresVerses = mockCreer.mock.calls.map((appel) => (appel[0] as { titre: string }).titre)
    expect(titresVerses).toHaveLength(25)
    expect(titresVerses).not.toContain('Livre n°3')
    expect(titresVerses).not.toContain('Livre n°1')
    expect(mockCreerExemplaire).toHaveBeenCalledTimes(50)
  }, 15000)

  it('sélectionne et désélectionne toute la vue filtrée', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    const user = await chargerFichier(charger())

    // Vue filtrée : décoche la seule ligne « à préciser »
    await user.click(screen.getByLabelText('À préciser (1)'))
    await user.click(screen.getByText('Tout désélectionner (1)'))
    expect(screen.getByRole('button', { name: 'Importer les 26 livres' })).toBeDefined()

    await user.click(screen.getByLabelText('Toutes (28)'))
    expect((screen.getByLabelText("Importer « Livre n°3 » (ligne 5)") as HTMLInputElement).checked).toBe(false)
    // La sélection courante (26) est rappelée, et il reste 26 lignes à re-cocher
    expect(screen.getByText('Tout sélectionner (27)')).toBeDefined()
    expect(screen.getByText('Tout désélectionner (26)')).toBeDefined()

    await user.click(screen.getByText('Tout sélectionner (27)'))
    expect(screen.getByRole('button', { name: 'Importer les 27 livres' })).toBeDefined()
    expect((screen.getByLabelText("Importer « Livre n°3 » (ligne 5)") as HTMLInputElement).checked).toBe(true)

    // Tout décocher éteint le bouton (aucune ligne cochée)
    await user.click(screen.getByText('Tout désélectionner (27)'))
    const bouton = screen.getByText('Sélectionne au moins une ligne').closest('button') as HTMLButtonElement
    expect(bouton.disabled).toBe(true)
  })

  it('conserve la sélection entre les pages de l aperçu', async () => {
    catalogueRetour.data = CATALOGUE
    const vue = rendre()
    const user = await chargerFichier(charger())

    searchParamsCourants.params = new URLSearchParams('page=2')
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    vue.rerender(
      <QueryClientProvider client={client}>
        <Suspense fallback={null}>
          <ImportView />
        </Suspense>
      </QueryClientProvider>,
    )

    // Page 2 : Livre n°15 → n°27 (13 lignes)
    await user.click(screen.getByLabelText("Importer « Livre n°15 » (ligne 17)"))
    expect(screen.getByRole('button', { name: 'Importer les 26 livres' })).toBeDefined()
  })

  it('importe : jauge en cours puis bilan succès et échec en table', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    const user = await chargerFichier(charger())

    // Premier versement lent (jauge visible), puis un échec serveur (2ᵉ livre)
    mockCreer.mockImplementationOnce(
      () => new Promise<number>((resolve) => setTimeout(() => resolve(1000), 120)),
    )
    mockCreer.mockRejectedValueOnce(new Error('boom serveur'))

    await user.click(screen.getByRole('button', { name: 'Importer les 27 livres' }))

    // Pendant : écran jauge avec le livre courant
    await waitFor(() => {
      expect(screen.getByText(/Enregistrement de 1 sur 27 : « Livre n°1 »/)).toBeDefined()
    }, { timeout: 5000 })
    const jauge = screen.getByRole('progressbar', { name: "Progression de l'import des livres" })
    expect(jauge.getAttribute('aria-valuemax')).toEqual('27')
    expect(jauge.getAttribute('aria-valuenow')).toEqual('1')
    expect(screen.getByText(/ne pas fermer cette page/)).toBeDefined()

    // Après : bilan succès + ligne ignorée en table
    await waitFor(() => {
      expect(screen.getByText('Import terminé')).toBeDefined()
    }, { timeout: 5000 })
    expect(screen.getByText(/26 livres ajoutés au catalogue/)).toBeDefined()
    // « Livre n°2 » a échoué (rejet serveur), n°3 était « à préciser »
    expect(screen.getByText(/dont 1 livre sans niveau ni catégorie reconnu/)).toBeDefined()
    expect(screen.getByText(/1 ligne ignorée/)).toBeDefined()
    expect(screen.getByText(/boom serveur/)).toBeDefined()
    expect(screen.getByText('Livre n°2')).toBeDefined()

    // Versement : 27 créations demandées, 26 abouties → 26 × 2 exemplaires
    expect(mockCreer).toHaveBeenCalledTimes(27)
    expect(mockCreerExemplaire).toHaveBeenCalledTimes(52)
  }, 15000)

  it('revient à l ecran de selection depuis le bilan', async () => {
    catalogueRetour.data = CATALOGUE
    rendre()
    const user = await chargerFichier(charger())

    await user.click(screen.getByRole('button', { name: 'Importer les 27 livres' }))
    await waitFor(() => {
      expect(screen.getByText('Import terminé')).toBeDefined()
    }, { timeout: 5000 })

    await user.click(screen.getByText(/Importer un autre fichier/))
    expect(screen.getByRole('heading', { name: 'Importer des livres' })).toBeDefined()
    expect(screen.getByLabelText('Fichier CSV')).toBeDefined()
  })
})