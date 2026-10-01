'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Combobox, type ComboboxOption } from '@/components/molecules/m-combobox'
import { Radios, type RadioOption } from '@/components/molecules/m-radios'
import { Input } from '@/components/molecules/m-input'
import { Modal } from '@/components/molecules/m-modal'
import { Toast } from '@/components/molecules/m-toast'
import { SegmentedToggle } from '@/components/molecules/m-segmented-toggle'
import { MonthCalendarCard } from '@/calendrier'
import type { CategorieMarqueurCalendrier, MarqueurJourCalendrier } from '@/calendrier'

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
        <Button onClick={() => setToast({ message: 'Action enregistrée', type: 'success' })} type="button" variant="success">
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

const DEMO_ELEVES: ComboboxOption<number>[] = [
  { id: 'eleve-1', label: 'Léa Martin', sublabel: 'CM2 · Groupe A', value: 1 },
  { id: 'eleve-2', label: 'Lucas Mériadec', sublabel: 'CM1 · Groupe B', value: 2 },
  { id: 'eleve-3', label: 'Chloé Nguyen', sublabel: '6e · Groupe A', value: 3 },
  { id: 'eleve-4', label: 'Ethan Bernard', sublabel: '5e · Groupe B', value: 4 },
  { id: 'eleve-5', disabled: true, label: 'Jules Petit', sublabel: 'CM2 · Groupe A (inactif)', value: 5 },
  { id: 'eleve-6', label: 'Léa Dupont', sublabel: 'CE2 · Groupe C', value: 6 },
]

export function DemoCombobox() {
  const [selection, setSelection] = useState<ComboboxOption<number> | null>(null)

  return (
    <div>
      <Combobox
        hint="Tape un prénom ou un nom — accents et casse ignorés."
        id="demo-combobox-eleve"
        label="Élève"
        onChange={setSelection}
        options={DEMO_ELEVES}
        placeholder="Ex. Léa"
      />
      <p className="lpv-muted" style={{ marginTop: '0.75rem' }}>
        {selection
          ? `Sélectionné : ${selection.label} — ${selection.sublabel}`
          : 'Aucun élève sélectionné.'}
      </p>
    </div>
  )
}

const DEMO_CATEGORIES: CategorieMarqueurCalendrier[] = [
  { couleur: 'blue', forme: 'point', id: 'seance', label: 'Séance programmée' },
  { couleur: 'magenta', forme: 'carre', id: 'evenement', label: 'Événement association' },
]

const DEMO_CUSTOM: CategorieMarqueurCalendrier[] = [
  { couleur: 'green', forme: 'point', id: 'presence', label: 'Présence validée' },
  { couleur: 'orange', forme: 'point', id: 'retard', label: 'Retour en attente' },
  { couleur: 'yellow', forme: 'carre', id: 'sortie', label: 'Sortie pédagogique' },
]

const DEMO_MARQUEURS: MarqueurJourCalendrier[] = [
  { type: 'seance', date: new Date(2026, 8, 2) },
  { type: 'seance', date: new Date(2026, 8, 4) },
  { type: 'seance', date: new Date(2026, 8, 9) },
  { type: 'seance', date: new Date(2026, 8, 11) },
  { type: 'seance', date: new Date(2026, 8, 16) },
  { type: 'seance', date: new Date(2026, 8, 18) },
  { type: 'evenement', date: new Date(2026, 8, 14) },
]

const DEMO_MARQUEURS_CUSTOM: MarqueurJourCalendrier[] = [
  { type: 'presence', date: new Date(2026, 9, 2) },
  { type: 'retard', date: new Date(2026, 9, 4) },
  { type: 'presence', date: new Date(2026, 9, 9) },
  { type: 'sortie', date: new Date(2026, 9, 12) },
  { type: 'presence', date: new Date(2026, 9, 16) },
  { type: 'retard', date: new Date(2026, 9, 18) },
  { type: 'presence', date: new Date(2026, 10, 18) },
]

function DemoDetailJour({ jour }: { jour: Date }) {
  const seances: Record<number, { heure: string; label: string }[]> = {
    2: [{ heure: '14:00', label: 'Maths — Alice, Bob' }],
    4: [{ heure: '10:00', label: 'Français — Clara' }],
    9: [{ heure: '16:00', label: 'Anglais — Dylan' }],
    12: [{ heure: '09:00', label: 'Sortie musée (tous groupes)' }],
    14: [{ heure: '18:00', label: 'Assemblée générale' }],
    16: [{ heure: '14:00', label: 'Maths — Alice, Bob' }],
    18: [{ heure: '10:00', label: 'Français — Clara' }, { heure: '15:00', label: 'Maths — Dylan' }],
  }
  const duJour = seances[jour.getDate()]
  if (!duJour) return <p className="text-white opacity-60" style={{ margin: 0 }}>Aucune séance ce jour.</p>
  return (
    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
      {duJour.map((s) => (
        <li key={`${s.heure}-${s.label}`}>{s.heure} — {s.label}</li>
      ))}
    </ul>
  )
}

export function DemoMonthCalendars() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
      <MonthCalendarCard
        categories={DEMO_CATEGORIES}
        marqueurs={DEMO_MARQUEURS}
        mois={new Date(2026, 8, 1)}
        renduDetailJour={(jour) => <DemoDetailJour jour={jour} />}
        voirToutHref="/profs"
      />
      <MonthCalendarCard
        categories={DEMO_CUSTOM}
        marqueurs={DEMO_MARQUEURS_CUSTOM}
        mois={new Date(2026, 9, 1)}
        renduDetailJour={(jour) => <DemoDetailJour jour={jour} />}
      />
    </div>
  )
}
