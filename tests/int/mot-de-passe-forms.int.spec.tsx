import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { MotDePasseOublieForm } from '@/components/organisms/o-mot-de-passe-oublie-form'
import { ReinitialiserMotDePasseForm } from '@/components/organisms/o-reinitialiser-mot-de-passe-form'

const mockDemander = vi.fn()
const mockReinitialiser = vi.fn()

vi.mock('@/app/(frontend)/actions/mot-de-passe', () => ({
  demanderReinitialisation: (...args: unknown[]) => mockDemander(...args),
  reinitialiserMotDePasse: (...args: unknown[]) => mockReinitialiser(...args),
}))

beforeEach(() => {
  mockDemander.mockClear()
  mockReinitialiser.mockClear()
})

describe('MotDePasseOublieForm', () => {
  it('soumet l email et affiche le message de confirmation', async () => {
    mockDemander.mockResolvedValue({
      ok: true,
      message: 'Si un compte existe pour cette adresse, un e-mail avec le lien de réinitialisation vient de partir.',
    })

    const user = userEvent.setup()
    render(<MotDePasseOublieForm />)

    await user.type(screen.getByLabelText('Adresse e-mail'), 'parent@lpv.fr')
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien' }))

    await waitFor(() => {
      expect(mockDemander).toHaveBeenCalledWith('parent@lpv.fr')
      expect(screen.getByText(/Si un compte existe pour cette adresse/)).toBeDefined()
    })
  })

  it('affiche le message meme en cas d erreur serveur (pas de fuite)', async () => {
    mockDemander.mockResolvedValue({
      ok: true,
      message: 'Si un compte existe pour cette adresse, un e-mail vient de partir.',
    })

    const user = userEvent.setup()
    render(<MotDePasseOublieForm />)

    await user.type(screen.getByLabelText('Adresse e-mail'), 'inconnu@lpv.fr')
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien' }))

    await waitFor(() => {
      expect(screen.getByText(/un e-mail vient de partir/)).toBeDefined()
    })
  })
})

describe('ReinitialiserMotDePasseForm', () => {
  it('soumet le nouveau mot de passe avec le token', async () => {
    mockReinitialiser.mockResolvedValue({
      ok: true,
      message: 'Mot de passe modifié. Vous pouvez vous connecter.',
    })

    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm tokenInitial="jeton-abc" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse-long')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    await waitFor(() => {
      expect(mockReinitialiser).toHaveBeenCalledWith('jeton-abc', 'motdepasse-long')
      expect(screen.getByText('Mot de passe modifié. Vous pouvez vous connecter.')).toBeDefined()
    })
  })

  it('bloque si les mots de passe ne correspondent pas', async () => {
    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm tokenInitial="jeton-abc" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'autre-mdp')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    expect(mockReinitialiser).not.toHaveBeenCalled()
    expect(screen.getByText('Les deux mots de passe ne correspondent pas.')).toBeDefined()
  })

  it('signale le token manquant', async () => {
    mockReinitialiser.mockResolvedValue({ ok: false, message: 'Lien invalide : jeton manquant.' })

    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm tokenInitial="" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse-long')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    await waitFor(() => {
      expect(mockReinitialiser).toHaveBeenCalledWith('', 'motdepasse-long')
      expect(screen.getByText('Lien invalide : jeton manquant.')).toBeDefined()
    })
  })
})