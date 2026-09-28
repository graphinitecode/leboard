'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Label } from '@/components/atoms/a-label'
import { Modal } from '@/components/molecules'

// Organisme : fenêtre de confirmation proportionnée. Variante simple
// (Annuler/Confirmer) pour les actions modérément sensibles, variante
// « mot de passe » pour les actions patrimoniales (l'identité du compte
// connecté est revérifiée côté serveur avant l'écriture). Le champ mot
// de passe ne garde rien en cache : il est vidé à chaque ouverture.
export function ConfirmAction({
  title,
  description,
  confirmLabel = 'Confirmer',
  pendingLabel = 'Confirmation…',
  requirePassword = false,
  pending = false,
  error = null,
  onConfirm,
  onClose = () => undefined,
}: {
  title: string
  description: string
  confirmLabel?: string
  pendingLabel?: string
  requirePassword?: boolean
  pending?: boolean
  error?: string | null
  onConfirm: (motDePasse?: string) => void
  onClose?: () => void
}) {
  // Champ vide à chaque ouverture : la modale est montée/réinitialisée
  // par l'appelant (condition d'affichage), donc useState('') suffit.
  const [motDePasse, setMotDePasse] = useState('')

  return (
    <Modal onClose={onClose} title={title}>
      <p className="lpv-m-modal__text">{description}</p>
      {requirePassword ? (
        <div style={{ marginBottom: '1.25rem' }}>
          <Label htmlFor="confirm-action-password">Mot de passe du compte connecté</Label>
          <input
            autoComplete="current-password"
            className="lpv-a-input"
            id="confirm-action-password"
            onChange={(e) => setMotDePasse(e.target.value)}
            required
            type="password"
            value={motDePasse}
          />
        </div>
      ) : null}
      {error ? (
        <p role="alert" style={{ color: 'var(--lpv-red)', margin: '0 0 1rem' }}>
          {error}
        </p>
      ) : null}
      <div className="lpv-m-modal__actions">
        <Button disabled={pending} onClick={onClose} type="button" variant="secondary">
          Annuler
        </Button>
        <Button
          disabled={pending || (requirePassword && motDePasse.length === 0)}
          onClick={() => onConfirm(requirePassword ? motDePasse : undefined)}
          type="button"
          variant={requirePassword ? 'primary' : 'danger'}
        >
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}