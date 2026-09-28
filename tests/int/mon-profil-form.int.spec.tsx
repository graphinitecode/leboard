import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MonProfilForm } from '@/components/organisms/o-mon-profil-form'

const mockRefresh = vi.fn()
const mockUpdateMonProfil = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/app/(frontend)/actions/mon-profil', () => ({
  updateMonProfil: (...args: unknown[]) => mockUpdateMonProfil(...args),
}))

const initial = { prenom: 'Marie', nom: 'Dupont', telephone: '0612345678', email: 'marie@lpv.fr' }

beforeEach(() => {
  mockRefresh.mockClear()
  mockUpdateMonProfil.mockClear()
})

describe('MonProfilForm', () => {
  it('affiche les champs prenom nom telephone et l email en lecture seule', () => {
    render(<MonProfilForm initial={initial} portail="profs" />)

    expect(screen.getByLabelText('Prénom')).toHaveValue('Marie')
    expect(screen.getByLabelText('Nom')).toHaveValue('Dupont')
    expect(screen.getByLabelText(/Téléphone/)).toHaveValue('0612345678')
    expect(screen.getByText('marie@lpv.fr')).toBeDefined()
  })

  it('soumet le formulaire et affiche le toast de succes', async () => {
    mockUpdateMonProfil.mockResolvedValue({ ok: true })

    const user = userEvent.setup()
    render(<MonProfilForm initial={initial} portail="profs" />)

    await user.clear(screen.getByLabelText('Prénom'))
    await user.type(screen.getByLabelText('Prénom'), 'Marie-Claire')
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(mockUpdateMonProfil).toHaveBeenCalledWith({
        prenom: 'Marie-Claire',
        nom: 'Dupont',
        telephone: '0612345678',
      })
      expect(screen.getByText('Profil mis à jour')).toBeDefined()
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('affiche les erreurs de validation dans le summary', async () => {
    mockUpdateMonProfil.mockResolvedValue({
      ok: false,
      erreurs: [{ champ: 'nom', message: 'Le nom saisi est trop court.' }],
    })

    const user = userEvent.setup()
    render(<MonProfilForm initial={initial} portail="parents" />)

    await user.type(screen.getByLabelText('Nom'), ' ')

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => {
      expect(screen.getAllByText('Le nom saisi est trop court.').length).toBeGreaterThan(0)
    })
  })

  it('propose le lien admin pour les profs et le contact association pour les parents', () => {
    const { rerender } = render(<MonProfilForm initial={initial} portail="profs" />)

    expect(screen.getByText(/utilisez le panneau d/)).toBeDefined()

    rerender(<MonProfilForm initial={initial} portail="parents" />)

    expect(screen.getByText(/contactez l/)).toBeDefined()
  })
})