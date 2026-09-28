import { Suspense } from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LivreCatalogue, Pret } from '@/bibliotheque'
import type { Eleve } from '@/students'

const elevesRetour: { data?: Eleve[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const catalogueRetour: { data?: LivreCatalogue[]; isLoading: boolean; isError: boolean } = {
  data: [],
  isLoading: false,
  isError: false,
}
const pretsParEleve: Record<number, Pret[]> = {}
const mockEnregistrerPret = vi.fn()

vi.mock('@/bibliotheque', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/bibliotheque')>()
  return {
    ...original,
    useListCatalogue: () => catalogueRetour,
    useListPretsEnCours: (query?: { eleveId?: number }) => ({
      data: query?.eleveId != null ? (pretsParEleve[query.eleveId] ?? []) : [],
      isLoading: false,
      isError: false,
    }),
    useEnregistrerPret: () => ({ isPending: false, mutateAsync: mockEnregistrerPret }),
  }
})

vi.mock('@/students', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/students')>()
  return {
    ...original,
    useListElevesDuProf: () => elevesRetour,
  }
})

import NouveauPretView from '@/app/(frontend)/profs/bibliotheque/prets/nouveau/NouveauPretView'

const ELEVES: Eleve[] = [
  { id: 10, prenom: 'Lucas', nom: 'Martin', niveau: 'CM2', groupe: 'Groupe A' },
  { id: 11, prenom: 'Emma', nom: 'Roux', niveau: 'CM1', groupe: 'Groupe B' },
]

const CATALOGUE: LivreCatalogue[] = [
  {
    id: 100,
    titre: 'Le Petit Prince',
    auteur: 'A. de Saint-Exupéry',
    isbn: '978-2070408504',
    resume: null,
    editeur: null,
    niveau: null,
    categorie: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    exemplaires: [{ id: 1, code: 'LPV-0001', etat: 'neuf', disponible: false }],
  },
  {
    id: 101,
    titre: 'Vendredi',
    auteur: 'Michel Tournier',
    isbn: null,
    resume: null,
    editeur: null,
    niveau: null,
    categorie: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    exemplaires: [{ id: 2, code: 'LPV-0002', etat: 'bon', disponible: true }],
  },
  {
    id: 102,
    titre: 'Fantastique Maître Renard',
    auteur: 'Roald Dahl',
    isbn: null,
    resume: null,
    editeur: null,
    niveau: null,
    categorie: null,
    archived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    exemplaires: [{ id: 3, code: 'LPV-0003', etat: 'neuf', disponible: true }],
  },
]

const pretEnRetard = (): Pret => ({
  id: 50,
  eleveId: 10,
  eleveLabel: 'Lucas Martin',
  exemplaireCode: 'LPV-0009',
  livreLabel: 'Charlie et la chocolaterie',
  dateEmprunt: new Date(Date.now() - 30 * 86_400_000).toISOString(),
  dateRetourPrevue: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  dateRetourEffective: null,
})

type Utilisateur = ReturnType<typeof userEvent.setup>

const rendreVue = () =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <Suspense fallback={null}>
        <NouveauPretView profId={7} />
      </Suspense>
    </QueryClientProvider>,
  )

const choisirEleve = async (user: Utilisateur) => {
  // getByRole plutôt que getByLabelText : la liste ouverte porte aussi le
  // label (aria-label sur la listbox) — getByLabelText trouverait 2 éléments.
  await user.type(screen.getByRole('combobox', { name: 'Élève' }), 'lucas')
  await user.click(screen.getByText('Lucas Martin'))
}

const ajouterLivre = async (user: Utilisateur, requete: string, titre: string) => {
  await user.type(screen.getByRole('combobox', { name: 'Livres' }), requete)
  await user.click(within(screen.getByRole('listbox')).getByText(titre))
}

const allerAuRecap = async (user: Utilisateur) => {
  await choisirEleve(user)
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await ajouterLivre(user, 'vend', 'Vendredi')
  await ajouterLivre(user, 'renard', 'Fantastique Maître Renard')
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
  await user.click(screen.getByRole('button', { name: 'Continuer' }))
}

const confirmerMotDePasse = async (user: Utilisateur, motDePasse: string) => {
  const dialog = screen.getByRole('dialog', { name: 'Enregistrer ce prêt ?' })
  const bouton = within(dialog).getByRole('button', { name: 'Enregistrer le prêt' })
  expect(bouton).toBeDisabled()
  await user.type(screen.getByLabelText('Mot de passe du compte connecté'), motDePasse)
  await user.click(bouton)
}

// Dates à +14 j : candidats [J+14, J+15] pour tolérer un passage de minuit
// entre le calcul du composant et celui du test.
const libellesCourts = () =>
  [0, 1].map((delta) =>
    new Date(Date.now() + (14 + delta) * 86_400_000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    }),
  )

const libellesLongs = () =>
  [0, 1].map(
    (delta) =>
      new Date(Date.now() + (14 + delta) * 86_400_000).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
  )

const trouverTexte = (candidats: string[]) => {
  const element = candidats.map((libelle) => screen.queryByText(libelle)).find(Boolean)
  expect(element).not.toBeNull()
}

describe('NouveauPretView', () => {
  beforeEach(() => {
    elevesRetour.data = ELEVES
    catalogueRetour.data = CATALOGUE
    elevesRetour.isLoading = false
    catalogueRetour.isLoading = false
    pretsParEleve[10] = []
    pretsParEleve[11] = []
    mockEnregistrerPret.mockReset()
    mockEnregistrerPret.mockResolvedValue(undefined)
  })

  it('parcourt les 4 questions puis affiche l écran de confirmation', async () => {
    const user = userEvent.setup()
    rendreVue()

    expect(screen.getByText('Étape 1 sur 4')).toBeDefined()
    await choisirEleve(user)
    expect(screen.getByText('Lucas Martin')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Étape 2 sur 4')).toBeDefined()
    expect(screen.getByText('Quels livres emprunte Lucas Martin ?')).toBeDefined()
    await ajouterLivre(user, 'vend', 'Vendredi')
    await ajouterLivre(user, 'renard', 'Fantastique Maître Renard')
    expect(screen.getAllByRole('button', { name: 'Retirer' })).toHaveLength(2)

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Quand le livre doit-il être rendu ?')).toBeDefined()
    expect(screen.getByLabelText('Dans 2 semaines')).toBeChecked()
    trouverTexte(libellesCourts())

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Vérifiez et validez')).toBeDefined()
    expect(screen.getAllByText('Modifier')).toHaveLength(3)
    trouverTexte(libellesLongs())

    await user.click(screen.getByRole('button', { name: 'Enregistrer le prêt' }))
    const dialog = screen.getByRole('dialog', { name: 'Enregistrer ce prêt ?' })
    expect(
      within(dialog).getByText(
        /2 livres seront prêtés à Lucas Martin pour être rendus le .+\. Confirmez avec votre mot de passe\./,
      ),
    ).toBeDefined()

    await confirmerMotDePasse(user, 'secret')
    await waitFor(() => expect(mockEnregistrerPret).toHaveBeenCalledTimes(2))

    const commandes = mockEnregistrerPret.mock.calls.map(
      (call) =>
        call[0] as {
          eleveId: number
          exemplaireId: number
          motDePasse: string
          dateRetourPrevue: string
        },
    )
    expect(commandes[0]).toMatchObject({ eleveId: 10, exemplaireId: 2, motDePasse: 'secret' })
    expect(commandes[1]).toMatchObject({ eleveId: 10, exemplaireId: 3, motDePasse: 'secret' })
    expect(commandes[1].dateRetourPrevue).toBe(commandes[0].dateRetourPrevue)
    const epoch = new Date(commandes[0].dateRetourPrevue).getTime()
    const attendu = Date.now() + 14 * 86_400_000
    expect(epoch).toBeGreaterThanOrEqual(attendu - 3 * 3_600_000)
    expect(epoch).toBeLessThanOrEqual(attendu + 3 * 3_600_000)

    expect(await screen.findByRole('heading', { level: 1, name: 'Prêt enregistré' })).toBeDefined()
    expect(screen.getByText(/2 livres pour Lucas Martin, à rendre le /)).toBeDefined()
    expect(screen.getByText('Un rappel sera créé 2 jours avant la date de retour.')).toBeDefined()
    trouverTexte(libellesLongs())
    expect(screen.getByRole('link', { name: 'Retour à la bibliothèque' })).toBeDefined()

    await user.click(screen.getByText('Enregistrer un autre prêt'))
    expect(screen.getByText('Quel élève emprunte ?')).toBeDefined()
    expect(screen.getByRole('combobox', { name: 'Élève' })).toHaveValue('')
  })

  it('avertit sans bloquer quand l élève a déjà un livre en retard', async () => {
    const user = userEvent.setup()
    pretsParEleve[10] = [pretEnRetard()]
    rendreVue()

    await user.type(screen.getByRole('combobox', { name: 'Élève' }), 'lucas')
    await user.click(screen.getByText('Lucas Martin'))
    expect(
      screen.getByText(/a déjà 1 livre en retard : « Charlie et la chocolaterie »\./),
    ).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await ajouterLivre(user, 'vend', 'Vendredi')
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText(/Prêt possible, à toi de juger\./)).toBeDefined()
  })

  it('refuse de continuer sans élève choisi', async () => {
    const user = userEvent.setup()
    rendreVue()

    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByRole('alert')).toHaveTextContent("Choisis l'élève qui emprunte")
  })

  it('refuse de continuer sans livre et annonce l absence de résultat', async () => {
    const user = userEvent.setup()
    rendreVue()

    await choisirEleve(user)
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Étape 2 sur 4')).toBeDefined()
    expect(screen.getByRole('alert')).toHaveTextContent('Ajoute au moins un livre')

    await user.type(screen.getByRole('combobox', { name: 'Livres' }), 'inconnu')
    expect(screen.getByText('Aucun livre trouvé')).toBeDefined()
  })

  it('désactive les livres sans exemplaire disponible et permet de retirer un choix', async () => {
    const user = userEvent.setup()
    rendreVue()

    await choisirEleve(user)
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    await user.type(screen.getByRole('combobox', { name: 'Livres' }), 'prince')
    const option = within(screen.getByRole('listbox')).getByText('Le Petit Prince').closest('li')
    expect(option).toHaveAttribute('aria-disabled', 'true')
    await user.click(within(screen.getByRole('listbox')).getByText('Le Petit Prince'))
    expect(screen.queryByText(/exemplaire LPV-0001/)).toBeNull()

    // Le clic sur une option désactivée garde la saisie ('prince') : on vide
    // le champ avant de chercher le livre suivant.
    await user.clear(screen.getByRole('combobox', { name: 'Livres' }))
    await ajouterLivre(user, 'vend', 'Vendredi')
    expect(screen.getByText(/exemplaire LPV-0002/)).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Retirer' }))
    expect(screen.queryByText(/exemplaire LPV-0002/)).toBeNull()
  })

  it('isole les livres en échec et laisse le prêt relançable', async () => {
    const user = userEvent.setup()
    mockEnregistrerPret.mockResolvedValueOnce(undefined)
    mockEnregistrerPret.mockRejectedValueOnce(
      new Error('Limite de prêts simultanés atteinte pour cet élève.'),
    )
    rendreVue()

    await allerAuRecap(user)
    await user.click(screen.getByRole('button', { name: 'Enregistrer le prêt' }))
    await confirmerMotDePasse(user, 'secret')
    await waitFor(() => expect(mockEnregistrerPret).toHaveBeenCalledTimes(2))

    expect(screen.getByText('Vérifiez et validez')).toBeDefined()
    expect(screen.getByRole('alert')).toHaveTextContent(
      '« Fantastique Maître Renard » : Limite de prêts simultanés atteinte pour cet élève.',
    )
    expect(screen.getByText('1 livre sur 2 enregistrés.')).toBeDefined()
    expect(screen.queryByText('Vendredi')).toBeNull()
    expect(screen.getByText('Fantastique Maître Renard')).toBeDefined()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('arrête la boucle dès un échec de mot de passe', async () => {
    const user = userEvent.setup()
    mockEnregistrerPret.mockRejectedValueOnce(new Error('Mot de passe incorrect.'))
    rendreVue()

    await choisirEleve(user)
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await ajouterLivre(user, 'vend', 'Vendredi')
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    await user.click(screen.getByRole('button', { name: 'Continuer' }))

    await user.click(screen.getByRole('button', { name: 'Enregistrer le prêt' }))
    await confirmerMotDePasse(user, 'secret')
    await waitFor(() => expect(mockEnregistrerPret).toHaveBeenCalledTimes(1))

    expect(screen.getByText('Vérifiez et validez')).toBeDefined()
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('Mot de passe incorrect.')
    expect(screen.queryByText(/sur \d+ enregistré/)).toBeNull()
  })

  it('permet de revenir sur une réponse via les liens Modifier', async () => {
    const user = userEvent.setup()
    rendreVue()

    await allerAuRecap(user)
    expect(screen.getAllByText('Modifier')).toHaveLength(3)

    await user.click(screen.getAllByText('Modifier')[2])
    expect(screen.getByText('Quand le livre doit-il être rendu ?')).toBeDefined()
    await user.click(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Vérifiez et validez')).toBeDefined()

    await user.click(screen.getAllByText('Modifier')[0])
    expect(screen.getByText('Quel élève emprunte ?')).toBeDefined()
    expect(screen.getByText('Lucas Martin')).toBeDefined()
  })
})