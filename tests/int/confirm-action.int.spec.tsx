import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmAction } from '@/components/organisms/o-confirm-action'

describe('ConfirmAction', () => {
  it('rend la variante simple sans champ mot de passe', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmAction
        description="Cette action est définitive."
        onConfirm={onConfirm}
        title="Supprimer cette disponibilité ?"
      />,
    )

    expect(screen.getByText('Supprimer cette disponibilité ?')).toBeDefined()
    expect(screen.queryByLabelText('Mot de passe du compte connecté')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Confirmer' }))

    expect(onConfirm).toHaveBeenCalledWith(undefined)
  })

  it('variante mot de passe : confirm desactive tant que le champ est vide', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmAction
        description="Le prêt sera clôturé."
        onConfirm={onConfirm}
        requirePassword
        title="Marquer le retour du prêt ?"
      />,
    )

    const champ = screen.getByLabelText('Mot de passe du compte connecté')
    expect(champ.getAttribute('type')).toBe('password')
    expect((screen.getByRole('button', { name: 'Confirmer' }) as HTMLButtonElement).disabled).toBe(
      true,
    )

    await user.type(champ, 'secret')
    await user.click(screen.getByRole('button', { name: 'Confirmer' }))

    expect(onConfirm).toHaveBeenCalledWith('secret')
  })

  it('affiche l erreur et ne transmet pas le mot de passe au clic Annuler', async () => {
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmAction
        description="Le prêt sera clôturé."
        error="Mot de passe incorrect."
        onClose={onClose}
        onConfirm={onConfirm}
        requirePassword
        title="Marquer le retour ?"
      />,
    )

    expect(screen.getByText('Mot de passe incorrect.')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(onClose).toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('desactive les actions pendant le pending', () => {
    render(
      <ConfirmAction
        description="Le prêt sera clôturé."
        onConfirm={vi.fn()}
        pending
        requirePassword
        title="Marquer le retour ?"
      />,
    )

    expect(
      (screen.getByRole('button', { name: 'Annuler' }) as HTMLButtonElement).disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Confirmation…' }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('affiche le libelle pending pendant la mutation', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <ConfirmAction description="…" onConfirm={onConfirm} requirePassword title="Confirmer ?" />,
    )

    await user.type(screen.getByLabelText('Mot de passe du compte connecté'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Confirmer' }))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled()
    })
  })
})