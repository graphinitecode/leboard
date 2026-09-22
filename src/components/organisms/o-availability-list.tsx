'use client'

import { useEffect, useRef, useState, useTransition } from 'react'

import { BackLink } from '@/components/atoms/a-back-link'
import { Button } from '@/components/atoms/a-button'
import { Input, Modal, NotificationBanner, ErrorSummary, SummaryList, Toast } from '@/components/molecules'
import type { ActionSummaryList } from '@/components/molecules'

import {
  useAjouterDisponibilite,
  useModifierDisponibilite,
  useSupprimerDisponibilite,
} from '@/planning/application/planning.hooks'
import type { Disponibilite, JourSemaine } from '@/planning/domain/disponibilite.entity'

export interface DispoItem {
  jour: string
  heureDebut: string
  heureFin: string
}

const OPTIONS_JOUR = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
]

function dispoKey(dispo: DispoItem): string {
  return `${dispo.jour}|${dispo.heureDebut}|${dispo.heureFin}`
}

// Organisme : liste des disponibilités (summary-list GOV.UK) + modale + toast.
// Actions par row : Modifier (ré-ouvre l'assistant pré-rempli) et Supprimer (modale).
export function AvailabilityList({ dispos }: { dispos: DispoItem[] }) {
  const [pending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<DispoItem | null>(null)
  const [editTarget, setEditTarget] = useState<DispoItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [highlightKey, setHighlightKey] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supprimerDispo = useSupprimerDisponibilite()

  useEffect(() => {
    return () => {
      if (animationTimer.current) clearTimeout(animationTimer.current)
    }
  }, [])

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
  }

  function remove() {
    if (!deleteTarget) return
    const { jour, heureDebut, heureFin } = deleteTarget
    setDeleteTarget(null)
    startTransition(async () => {
      try {
        await supprimerDispo.mutateAsync({ heureDebut, heureFin, jour: jour as JourSemaine })
        showToast('Disponibilité supprimée', 'success')
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Échec de la suppression.', 'error')
      }
    })
  }

  function onSaved(dispo: DispoItem, previous: DispoItem | null) {
    if (animationTimer.current) clearTimeout(animationTimer.current)
    setHighlightKey(dispoKey(dispo))
    animationTimer.current = setTimeout(() => setHighlightKey(null), 2000)
    showToast(previous ? 'Disponibilité modifiée' : 'Disponibilité ajoutée', 'success')
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)} title="Supprimer cette disponibilité ?">
          <p className="lpv-m-modal__text">
            {deleteTarget.jour} · {deleteTarget.heureDebut} → {deleteTarget.heureFin} — cette action est définitive.
          </p>
          <div className="lpv-m-modal__actions">
            <Button onClick={() => setDeleteTarget(null)} type="button" variant="secondary">
              Annuler
            </Button>
            <Button disabled={pending} onClick={remove} type="button" variant="danger">
              {pending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </div>
        </Modal>
      )}

      <p style={{ margin: '0 0 1rem' }}>
        <Button onClick={() => setWizardOpen(true)} type="button">
          + Ajouter un créneau
        </Button>
      </p>

      {dispos.length > 0 && (
        <SummaryList
          highlightKey={highlightKey !== null ? highlightKey.split('|')[0] : undefined}
          items={dispos.map((dispo): { key: string; value: string; actions?: (ActionSummaryList | React.ReactNode)[] } => ({
            key: dispo.jour,
            value: `${dispo.heureDebut} → ${dispo.heureFin}`,
            actions: [
              {
                type: 'normal',
                label: 'Modifier',
                onClick: () => {
                  setEditTarget(dispo)
                  setWizardOpen(true)
                },
                disabled: pending,
              },
              {
                type: 'danger',
                label: 'Supprimer',
                key: 'supprimer',
                onClick: () => setDeleteTarget(dispo),
                disabled: pending,
              },
            ],
          }))}
        />
      )}

      <AvailabilityWizard
        editingFrom={editTarget}
        key={editTarget ? dispoKey(editTarget) : 'nouveau'}
        onClose={() => {
          setWizardOpen(false)
          setEditTarget(null)
        }}
        onSaved={onSaved}
        open={wizardOpen}
      />
    </>
  )
}

// Organisme : assistant d'ajout en 3 écrans.
// Écran 1 : jour (boutons de choix) — Écran 2 : heure de début —
// Écran 3 : heure de fin + récapitulatif, Valider (bleu) ou Modifier (orange).
export function AvailabilityWizard({
  open,
  onClose,
  onSaved,
  editingFrom,
}: {
  open: boolean
  onClose: () => void
  onSaved?: (dispo: DispoItem, previous: DispoItem | null) => void
  editingFrom?: DispoItem | null
}) {
  const [step, setStep] = useState(1)
  const [jour, setJour] = useState(editingFrom?.jour ?? '')
  const [heureDebut, setHeureDebut] = useState(editingFrom?.heureDebut ?? '')
  const [heureFin, setHeureFin] = useState(editingFrom?.heureFin ?? '')
  const [pending, startTransition] = useTransition()
  const [erreur, setErreur] = useState<string | null>(null)
  const [previous, setPrevious] = useState<DispoItem | null>(editingFrom ?? null)
  const ajouterDispo = useAjouterDisponibilite()
  const modifierDispo = useModifierDisponibilite()

  function reset() {
    onClose()
    setStep(1)
    setJour('')
    setHeureDebut('')
    setHeureFin('')
    setErreur(null)
    setPrevious(null)
  }

  function submit() {
    setErreur(null)
    startTransition(async () => {
      const nouveau = { heureDebut, heureFin, jour }

      try {
        if (previous) {
          await modifierDispo.mutateAsync({ nouveau: nouveau as Disponibilite, origine: previous as Disponibilite })
          setStep(1)
          setJour('')
          setHeureDebut('')
          setHeureFin('')
          setPrevious(null)
          onClose()
          onSaved?.(nouveau, previous)
          return
        }

        await ajouterDispo.mutateAsync(nouveau as Disponibilite)
        setStep(1)
        setJour('')
        setHeureDebut('')
        setHeureFin('')
        onClose()
        onSaved?.(nouveau, null)
      } catch (err) {
        setErreur(err instanceof Error ? err.message : 'La disponibilité n’a pas pu être enregistrée.')
      }
    })
  }

  if (!open) return null

  const dayLabel = OPTIONS_JOUR.find((o) => o.value === jour)?.label ?? jour
  const isEditing = Boolean(previous)

  return (
    <div className="lpv-card" style={{ marginTop: '1.5rem' }}>
      {step === 1 && (
        <>
          <p className="lpv-stepper__step">Étape 1 sur 3</p>
          <h2 className="lpv-stepper__question">
            {isEditing ? 'Quel jour pour cet horaire ?' : 'Quel jour vous convient ?'}
          </h2>
          <div className="lpv-o-availability-wizard__days">
            {OPTIONS_JOUR.map((option) => (
              <button
                className={`lpv-o-availability-wizard__day-option${jour === option.value ? ' lpv-o-availability-wizard__day-option--active' : ''}`}
                key={option.value}
                onClick={() => setJour(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="lpv-stepper__actions">
            <Button disabled={!jour} onClick={() => setStep(2)} type="button">
              Continuer
            </Button>
            <Button onClick={reset} type="button" variant="secondary">
              Annuler
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <BackLink href="#" onClick={(e) => { e.preventDefault(); setErreur(null); setStep(1) }}>Retour</BackLink>
          <p className="lpv-stepper__step">Étape 2 sur 3</p>
          <h2 className="lpv-stepper__question">Quelle heure de début ?</h2>
          <Input
            hint={`Début du créneau le ${dayLabel.toLowerCase()}.`}
            id="step-debut"
            label="De"
            max="22:00"
            min="08:00"
            onChange={(e) => setHeureDebut(e.target.value)}
            type="time"
            value={heureDebut}
          />
          {erreur && <ErrorSummary errors={[erreur]} />}
          <div className="lpv-stepper__actions">
            <Button
              disabled={!heureDebut}
              onClick={() => {
                setErreur(null)
                setStep(3)
              }}
              type="button"
            >
              Continuer
            </Button>
            <Button onClick={reset} type="button" variant="secondary">
              Annuler
            </Button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <BackLink href="#" onClick={(e) => { e.preventDefault(); setErreur(null); setStep(2) }}>Retour</BackLink>
          <p className="lpv-stepper__step">Étape 3 sur 3</p>
          <h2 className="lpv-stepper__question">Quelle heure de fin ?</h2>
          <Input
            hint={`Fin du créneau le ${dayLabel.toLowerCase()}.`}
            id="step-fin"
            label="À"
            max="22:00"
            min={heureDebut || '08:00'}
            onChange={(e) => setHeureFin(e.target.value)}
            type="time"
            value={heureFin}
          />
          <div className="lpv-recap" style={{ marginTop: '1rem' }}>
            <div className="lpv-recap__row">
              <span className="lpv-recap__key">Récapitulatif</span>
              <span>
                <strong>{dayLabel}</strong> · {heureDebut} → {heureFin || '…'}
              </span>
            </div>
          </div>
          {erreur && <ErrorSummary errors={[erreur]} />}
          <div className="lpv-stepper__actions">
            <Button disabled={!heureFin || pending} onClick={submit} type="button">
              {pending ? 'Enregistrement…' : isEditing ? 'Enregistrer la modification' : 'Valider'}
            </Button>
            <Button onClick={() => setStep(1)} type="button" variant="warning">
              Modifier
            </Button>
            <Button onClick={reset} type="button" variant="secondary">
              Annuler
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Gardé pour compat : bannière de succès inline (ancien FormDispo)
export function AvailabilityNotification({ message }: { message: string }) {
  return <NotificationBanner title={message} type="success" />
}
