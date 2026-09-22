'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Radios, type RadioOption } from '@/components/molecules/m-radios'
import { Input } from '@/components/molecules/m-input'
import { Modal } from '@/components/molecules/m-modal'
import { Toast } from '@/components/molecules/m-toast'
import { SegmentedToggle } from '@/components/molecules/m-segmented-toggle'

const RADIO_OPTIONS: RadioOption[] = [
  {
    conditional: <Input hint="Précisez les modalités." id="demo-radio-modalites" label="Modalités" optional />,
    label: 'Oui',
    value: 'oui',
  },
  { label: 'Non', value: 'non' },
]

export function DemoRadio() {
  const [value, setValue] = useState('non')

  return (
    <Radios
      idPrefix="demo-radio"
      name="accord"
      onChange={(e) => setValue(e.target.value)}
      options={RADIO_OPTIONS}
      value={value}
    />
  )
}

export function DemoToggle() {
  const [value, setValue] = useState('profs')

  async function onChange(newValue: string) {
    setValue(newValue)
    return { ok: true }
  }

  return (
    <SegmentedToggle
      ariaLabel="Portail"
      onChange={onChange}
      options={[
        { label: 'Profs', ariaLabel: 'Professeurs', value: 'profs' },
        { label: 'Parents', ariaLabel: 'Parents', value: 'parents' },
        { label: 'Élèves', ariaLabel: 'Élèves', value: 'eleves' },
      ]}
      initialValue={value}
    />
  )
}

export function DemoModale() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} type="button">Ouvrir la modale</Button>
      {open && (
        <Modal onClose={() => setOpen(false)} title="Confirmer l'action">
          <p className="lpv-m-modal__text">
            Êtes-vous sûr de vouloir continuer ? Cette action est irréversible.
          </p>
          <div className="lpv-m-modal__actions">
            <Button onClick={() => setOpen(false)} type="button" variant="secondary">
              Annuler
            </Button>
            <Button onClick={() => setOpen(false)} type="button" variant="danger">
              Confirmer
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

export function DemoToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={() => setToast({ message: 'Action enregistrée', type: 'success' })} type="button">
          Toast succès
        </Button>
        <Button onClick={() => setToast({ message: 'Une erreur est survenue', type: 'error' })} type="button" variant="danger">
          Toast erreur
        </Button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
