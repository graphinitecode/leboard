import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PretsEleveCardProps } from '@/components/organisms/o-prets-eleve-card'
import type { Pret } from '@/bibliotheque'

// Hooks module bibliothèque : les queries/mutations de prêts mockées, le
// reste original (helpers de retard).
const retourPrets: { data: Pret[]; isLoading: boolean } = { data: [], isLoading: false }
const marquerRetourneMock = vi.fn((_command: { motDePasse: string; pretId: number }) =>
  Promise.resolve(),
)

vi.mock('@/bibliotheque', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/bibliotheque')>()
  return {
    ...original,
    useListPretsEnCours: () => retourPrets,
    useMarquerRetourne: () => ({
      mutateAsync: (command: { motDePasse: string; pretId: number }) =>
        marquerRetourneMock(command),
      isPending: false,
    }),
  }
})

import { PretsEleveCard } from '@/components/organisms/o-prets-eleve-card'

const pretATemps: Pret = {
  id: 51,
  eleveId: 7,
  eleveLabel: 'Emma Roux',
  exemplaireCode: 'LPV-012',
  livreId: 9,
  livreLabel: 'Le Petit Prince',
  dateEmprunt: '2026-09-01T10:00:00.000Z',
  dateRetourPrevue: '2026-10-30T10:00:00.000Z',
  dateRetourEffective: null,
}

const pretEnRetard: Pret = {
  id: 52,
  eleveId: 7,
  eleveLabel: 'Emma Roux',
  exemplaireCode: 'LPV-007',
  livreId: 4,
  livreLabel: 'Matilda',
  dateEmprunt: '2026-08-01T10:00:00.000Z',
  dateRetourPrevue: '2020-01-01T10:00:00.000Z',
  dateRetourEffective: null,
}

const rendre = (props: Partial<PretsEleveCardProps> = {}) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <PretsEleveCard eleveId={7} eleveNom="Emma Roux" {...props} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  retourPrets.data = []
  retourPrets.isLoading = false
})

describe('PretsEleveCard', () => {
  it('vide : état vide « aucun livre en prêt »', () => {
    rendre()
    expect(screen.getByText('Aucun livre en prêt')).toBeDefined()
  })

  it('liste les prêts avec fiche du livre et bouton Rendre pour un gestionnaire', async () => {
    retourPrets.data = [pretATemps]
    const { container } = rendre({ peutGerer: true })

    expect(screen.getByText('Le Petit Prince')).toBeDefined()
    // Lien de consultation vers la fiche livre + bouton Rendre
    const lien = container.querySelector('a.lpv-link-inline')
    expect(lien?.getAttribute('href')).toBe('/profs/bibliotheque/livres/9')
    // aria-label descriptif → accessible-name, le texte porte « Rendre »
    expect(screen.getByText('Rendre')).toBeDefined()
  })

  it('sans droit de gestion : consultation seule, pas de bouton Rendre', () => {
    retourPrets.data = [pretATemps]
    const { container } = rendre()
    expect(container.querySelector('a.lpv-link-inline')).not.toBeNull()
    expect(screen.queryByText('Rendre')).toBeNull()
  })

  it('retard : carte d\u2019alerte rouge avec les jours de retard', () => {
    retourPrets.data = [pretEnRetard, pretATemps]
    const { container } = rendre({ peutGerer: true })

    expect(container.querySelector('.lpv-m-alert-card')).not.toBeNull()
    expect(screen.getByText(/en retard de/)).toBeDefined()
    // Le retard passe en tête de la liste
    expect(container.firstChild?.textContent?.indexOf('Matilda')).toBeLessThan(
      (container.textContent ?? '').indexOf('Le Petit Prince'),
    )
  })

  it('rendre : confirmation par mot de passe puis mutation', async () => {
    retourPrets.data = [pretATemps]
    rendre({ peutGerer: true })

    await userEvent.click(screen.getByText('Rendre'))
    // Modale de confirmation (mot de passe exigé)
    expect(screen.getByText('Marquer le prêt comme retourné ?')).toBeDefined()
    await userEvent.type(screen.getByLabelText(/Mot de passe/), 'mot-de-passe-sûr')
    await userEvent.click(screen.getByRole('button', { name: 'Confirmer le retour' }))

    await waitFor(() => expect(marquerRetourneMock).toHaveBeenCalledWith({
      motDePasse: 'mot-de-passe-sûr',
      pretId: 51,
    }))
  })
})