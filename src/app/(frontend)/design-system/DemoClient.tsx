'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Radios, type OptionRadio } from '@/components/molecules/m-radios'
import { Input } from '@/components/molecules/m-input'
import { Modale } from '@/components/molecules/m-modal'
import { Toast } from '@/components/molecules/m-toast'
import { ToggleSegmentes } from '@/components/molecules/m-segmented-toggle'

const RADIO_OPTIONS: OptionRadio[] = [
  {
    conditionnel: <Input hint="Précisez les modalités." id="demo-radio-modalites" label="Modalités" optionnel />,
    texte: 'Oui',
    valeur: 'oui',
  },
  { texte: 'Non', valeur: 'non' },
]

export function DemoRadio() {
  const [valeur, setValeur] = useState('non')

  return (
    <Radios
      idPrefix="demo-radio"
      nom="accord"
      onChange={(e) => setValeur(e.target.value)}
      options={RADIO_OPTIONS}
      valeur={valeur}
    />
  )
}

export function DemoToggle() {
  const [valeur, setValeur] = useState('profs')

  async function onChanger(nouvelleValeur: string) {
    setValeur(nouvelleValeur)
    return { ok: true }
  }

  return (
    <ToggleSegmentes
      ariaLabel="Portail"
      onChanger={onChanger}
      options={[
        { label: 'Profs', libelle: 'Professeurs', value: 'profs' },
        { label: 'Parents', libelle: 'Parents', value: 'parents' },
        { label: 'Élèves', libelle: 'Élèves', value: 'eleves' },
      ]}
      valeurInitiale={valeur}
    />
  )
}

export function DemoModale() {
  const [ouverte, setOuverte] = useState(false)

  return (
    <>
      <Button onClick={() => setOuverte(true)} type="button">Ouvrir la modale</Button>
      {ouverte && (
        <Modale onFerme={() => setOuverte(false)} titre="Confirmer l'action">
          <p className="lpv-modale__texte">
            Êtes-vous sûr de vouloir continuer ? Cette action est irréversible.
          </p>
          <div className="lpv-modale__actions">
            <Button onClick={() => setOuverte(false)} type="button" variante="secondaire">
              Annuler
            </Button>
            <Button onClick={() => setOuverte(false)} type="button" variante="danger">
              Confirmer
            </Button>
          </div>
        </Modale>
      )}
    </>
  )
}

export function DemoToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'erreur' } | null>(null)

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button onClick={() => setToast({ message: 'Action enregistrée', type: 'success' })} type="button">
          Toast succès
        </Button>
        <Button onClick={() => setToast({ message: 'Une erreur est survenue', type: 'erreur' })} type="button" variante="danger">
          Toast erreur
        </Button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onFerme={() => setToast(null)} />}
    </>
  )
}
