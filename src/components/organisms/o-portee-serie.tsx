'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Modal } from '@/components/molecules/m-modal'
import { Radios, type RadioOption } from '@/components/molecules/m-radios'
import type { PorteeSerie } from '@/seances/domain/recurrence'

export const OPTIONS_PORTEE: RadioOption[] = [
  { label: 'Cette séance seulement', value: 'une' },
  { label: 'Cette séance et les suivantes', value: 'suivantes' },
  {
    hint: 'Les séances déjà passées ne sont pas modifiées.',
    label: 'Toutes les séances de la série',
    value: 'toutes',
  },
]

// Organisme : choix de la portée d'une modification dans une série de
// séances (motif des agendas : cette séance / les suivantes / toute la série).
export function PorteeSerieModal({
  titre,
  confirmLabel,
  danger = false,
  pending = false,
  onConfirm,
  onClose,
}: {
  titre: string
  confirmLabel: string
  danger?: boolean
  pending?: boolean
  onConfirm: (portee: PorteeSerie) => void
  onClose: () => void
}) {
  const [portee, setPortee] = useState<PorteeSerie>('une')

  return (
    <Modal onClose={onClose} title={titre}>
      <Radios
        legendSize="s"
        name="Cette séance fait partie d’une série. Appliquer à :"
        idPrefix="portee-serie"
        onChange={(e) => setPortee(e.target.value as PorteeSerie)}
        options={OPTIONS_PORTEE}
        value={portee}
      />
      <div className="lpv-m-modal__actions">
        <Button disabled={pending} onClick={onClose} type="button" variant="primary">
          Annuler
        </Button>
        <Button
          disabled={pending}
          onClick={() => onConfirm(portee)}
          type="button"
          variant={danger ? 'danger' : 'success'}
        >
          {pending ? 'Enregistrement…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
