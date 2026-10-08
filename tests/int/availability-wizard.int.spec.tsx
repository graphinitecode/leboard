import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import NouvelleDisponibiliteView from '@/app/(frontend)/profs/disponibilites/nouvelle/NouvelleDisponibiliteView'

const ajouter = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => searchParams,
}))

vi.mock('@/planning/application/planning.hooks', () => ({
  useAjouterDisponibilite: () => ({ mutateAsync: ajouter }),
  useModifierDisponibilite: () => ({ mutateAsync: vi.fn() }),
}))

function continuer() {
  fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))
}

describe('NouvelleDisponibiliteView', () => {
  beforeEach(() => {
    ajouter.mockReset().mockResolvedValue(undefined)
    searchParams = new URLSearchParams()
  })

  it('pose une question par écran, récapitule à la fin puis confirme', async () => {
    render(<NouvelleDisponibiliteView />)

    fireEvent.click(screen.getByRole('button', { name: 'Lundi' }))
    continuer()

    // Pas de récapitulatif pendant les questions
    expect(screen.queryByText('Vérifiez vos réponses')).toBeNull()
    fireEvent.change(screen.getByLabelText(/De/), { target: { value: '14:00' } })
    continuer()

    fireEvent.change(screen.getByLabelText(/^À/), { target: { value: '16:00' } })
    continuer()

    expect(screen.getByRole('heading', { name: 'Vérifiez vos réponses' })).toBeDefined()
    expect(screen.getByText('Lundi')).toBeDefined()
    expect(screen.getByText('14:00')).toBeDefined()
    expect(screen.getByText('16:00')).toBeDefined()
    expect(ajouter).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter ce créneau' }))

    await waitFor(() => expect(screen.getByText('Votre créneau est enregistré')).toBeDefined())
    expect(ajouter).toHaveBeenCalledWith({ heureDebut: '14:00', heureFin: '16:00', jour: 'lundi' })
    expect(screen.getByRole('button', { name: 'Ajouter un autre créneau' })).toBeDefined()
  })

  it('signale une heure de fin invalide sur sa question, avant le récapitulatif', () => {
    render(<NouvelleDisponibiliteView />)

    fireEvent.click(screen.getByRole('button', { name: 'Mardi' }))
    continuer()
    fireEvent.change(screen.getByLabelText(/De/), { target: { value: '14:00' } })
    continuer()
    fireEvent.change(screen.getByLabelText(/^À/), { target: { value: '13:00' } })
    continuer()

    expect(screen.getByRole('heading', { name: 'Quelle heure de fin ?' })).toBeDefined()
    expect(screen.queryByText('Vérifiez vos réponses')).toBeNull()
  })
})
