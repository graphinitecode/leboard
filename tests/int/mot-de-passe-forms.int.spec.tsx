import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import MotDePasseOublieView from '@/app/(frontend)/mot-de-passe-oublie/MotDePasseOublieView'
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

describe('MotDePasseOublieView', () => {
  it('affiche le back-link vers la connexion du portail et le bouton', () => {
    render(<MotDePasseOublieView portail="profs" />)

    expect(screen.getByRole('heading', { name: 'Réinitialiser votre mot de passe' })).toBeDefined()
    const backLink = screen.getByRole('link', { name: 'Retour à la connexion' })
    expect(backLink).toHaveAttribute('href', '/profs/login')
    expect(screen.getByLabelText('Adresse e-mail')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Envoyer le lien' })).toBeDefined()
  })

  it('bloque une soumission vide côté client sans appel serveur', async () => {
    const user = userEvent.setup()
    render(<MotDePasseOublieView portail="profs" />)

    await user.click(screen.getByRole('button', { name: 'Envoyer le lien' }))

    expect(screen.getByText('Il y a un problème')).toBeDefined()
    // Le texte d'erreur est affiché deux fois (résumé + erreur inline du champ).
    expect(screen.getAllByText('Saisissez votre adresse e-mail').length).toBeGreaterThan(0)
    expect(mockDemander).not.toHaveBeenCalled()
  })

  it('rejette une adresse mal formée côté client sans appel serveur', async () => {
    const user = userEvent.setup()
    render(<MotDePasseOublieView portail="profs" />)

    await user.type(screen.getByLabelText('Adresse e-mail'), 'invalide')
    await user.click(screen.getByRole('button', { name: 'Envoyer le lien' }))

    expect(screen.getByText('Il y a un problème')).toBeDefined()
    expect(screen.getAllByText(/format nom@exemple\.fr/).length).toBeGreaterThan(0)
    expect(mockDemander).not.toHaveBeenCalled()
  })

  it('envoie le lien puis affiche l écran de confirmation (portail profs)', async () => {
    mockDemander.mockResolvedValue({
      ok: true,
      message: 'Si un compte existe pour cette adresse, un e-mail vient de partir.',
    })

    const user = userEvent.setup()
    render(<MotDePasseOublieView portail="profs" />)

    await user.type(screen.getByLabelText('Adresse e-mail'), 'parent@lpv.fr')
    await user.click(screen.getByRole('button', { name: 'Envoyer le lien' }))

    await waitFor(() => {
      expect(mockDemander).toHaveBeenCalledWith('parent@lpv.fr')
      expect(screen.getByRole('heading', { name: 'Consultez vos e-mails' })).toBeDefined()
    })
    // Pas d'énumération : « si un compte existe » quel que soit le résultat serveur.
    expect(screen.getByText(/Si l'adresse e-mail/)).toBeDefined()
    expect(screen.getByText('parent@lpv.fr')).toBeDefined()
    expect(screen.getByText(/valable 2 heures/)).toBeDefined()
    const lienSucces = screen.getByRole('link', { name: 'Revenir à la connexion' })
    expect(lienSucces).toHaveAttribute('href', '/profs/login')
  })

  it('oriente le retour à la connexion vers le portail parents', async () => {
    mockDemander.mockResolvedValue({ ok: true, message: '' })

    const user = userEvent.setup()
    render(<MotDePasseOublieView portail="parents" />)

    expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toHaveAttribute(
      'href',
      '/parents/login',
    )

    await user.type(screen.getByLabelText('Adresse e-mail'), 'parent@lpv.fr')
    await user.click(screen.getByRole('button', { name: 'Envoyer le lien' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Consultez vos e-mails' })).toBeDefined()
    })
    expect(screen.getByRole('link', { name: 'Revenir à la connexion' })).toHaveAttribute(
      'href',
      '/parents/login',
    )
  })
})

describe('ReinitialiserMotDePasseForm', () => {
  it('modifie le mot de passe et propose la connexion au bon portail', async () => {
    mockReinitialiser.mockResolvedValue({
      ok: true,
      message: 'Mot de passe modifié. Vous pouvez vous connecter.',
    })

    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm portail="profs" tokenInitial="jeton-abc" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse-long')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    await waitFor(() => {
      expect(mockReinitialiser).toHaveBeenCalledWith('jeton-abc', 'motdepasse-long')
      expect(screen.getByText('Mot de passe modifié. Vous pouvez vous connecter.')).toBeDefined()
      expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute(
        'href',
        '/profs/login',
      )
    })
  })

  it('bloque si les mots de passe ne correspondent pas', async () => {
    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm portail="profs" tokenInitial="jeton-abc" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'autre-mdp')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    expect(mockReinitialiser).not.toHaveBeenCalled()
    expect(screen.getByText('Il y a un problème')).toBeDefined()
    expect(
      screen.getAllByText('Les deux mots de passe ne correspondent pas.').length,
    ).toBeGreaterThan(0)
  })

  it('affiche l erreur serveur dans le résumé', async () => {
    mockReinitialiser.mockResolvedValue({ ok: false, message: 'Lien invalide : jeton expiré.' })

    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm portail="profs" tokenInitial="jeton-abc" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse-long')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    await waitFor(() => {
      expect(screen.getByText('Il y a un problème')).toBeDefined()
      expect(screen.getAllByText('Lien invalide : jeton expiré.').length).toBeGreaterThan(0)
    })
  })

  it('signale le token manquant', async () => {
    mockReinitialiser.mockResolvedValue({ ok: false, message: 'Lien invalide : jeton manquant.' })

    const user = userEvent.setup()
    render(<ReinitialiserMotDePasseForm portail="profs" tokenInitial="" />)

    await user.type(screen.getByLabelText('Nouveau mot de passe'), 'motdepasse-long')
    await user.type(screen.getByLabelText('Confirmer le mot de passe'), 'motdepasse-long')
    await user.click(screen.getByRole('button', { name: 'Modifier le mot de passe' }))

    await waitFor(() => {
      expect(mockReinitialiser).toHaveBeenCalledWith('', 'motdepasse-long')
      expect(screen.getAllByText('Lien invalide : jeton manquant.').length).toBeGreaterThan(0)
    })
  })
})