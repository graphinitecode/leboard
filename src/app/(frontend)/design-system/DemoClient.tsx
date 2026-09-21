'use client'

import { useState } from 'react'

import { Bouton } from '@/components/atoms/Bouton'
import { Modale } from '@/components/molecules/Modale'
import { Toast } from '@/components/molecules/Toast'
import { ToggleSegmentes } from '@/components/molecules/ToggleSegmentes'

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
        { label: 'Profs', libelle: 'Espace profs', value: 'profs' },
        { label: 'Parents', libelle: 'Espace parents', value: 'parents' },
        { label: 'Élèves', libelle: 'Espace élèves', value: 'eleves' },
      ]}
      valeurInitiale={valeur}
    />
  )
}

export function DemoModale() {
  const [ouverte, setOuverte] = useState(false)

  return (
    <>
      <Bouton onClick={() => setOuverte(true)} type="button">Ouvrir la modale</Bouton>
      {ouverte && (
        <Modale onFerme={() => setOuverte(false)} titre="Confirmer l'action">
          <p className="lpv-modale__texte">
            Êtes-vous sûr de vouloir continuer ? Cette action est irréversible.
          </p>
          <div className="lpv-modale__actions">
            <Bouton onClick={() => setOuverte(false)} type="button" variante="secondaire">
              Annuler
            </Bouton>
            <Bouton onClick={() => setOuverte(false)} type="button" variante="danger">
              Confirmer
            </Bouton>
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
        <Bouton onClick={() => setToast({ message: 'Action enregistrée', type: 'success' })} type="button">
          Toast succès
        </Bouton>
        <Bouton onClick={() => setToast({ message: 'Une erreur est survenue', type: 'erreur' })} type="button" variante="danger">
          Toast erreur
        </Bouton>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onFerme={() => setToast(null)} />}
    </>
  )
}
