'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Modal, Toast } from '@/components/molecules'
import type { ActionSummaryList } from '@/components/molecules'
import { SummaryList } from '@/components/molecules/m-lists'

import { useSupprimerDisponibilite } from '@/planning/application/planning.hooks'
import type { JourSemaine } from '@/planning/domain/disponibilite.entity'

export interface DispoItem {
  jour: string
  heureDebut: string
  heureFin: string
}

// Organisme : liste des disponibilités (summary-list GOV.UK) + modale + toast.
// Actions par row : Modifier (renvoie vers la page dédiée pré-remplie) et
// Supprimer (modale). L'ajout et la modification se font sur la page dédiée
// /profs/disponibilites/nouvelle (parcours « une question par écran »).
export function AvailabilityList({ dispos }: { dispos: DispoItem[] }) {
  const [pending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<DispoItem | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const supprimerDispo = useSupprimerDisponibilite()

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
        <Button href="/profs/disponibilites/nouvelle" type="button">
          + Ajouter un créneau
        </Button>
      </p>

      {dispos.length > 0 && (
        <SummaryList
          items={dispos.map((dispo): { key: string; value: string; actions?: (ActionSummaryList | React.ReactNode)[] } => ({
            key: dispo.jour,
            value: `${dispo.heureDebut} → ${dispo.heureFin}`,
            actions: [
              {
                type: 'normal',
                label: 'Modifier',
                href: urlModifierDispo(dispo),
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
    </>
  )
}

// URL du parcours d'édition avec préremplissage (jour + heures du créneau).
function urlModifierDispo(dispo: DispoItem): string {
  const params = new URLSearchParams({
    debut: dispo.heureDebut,
    fin: dispo.heureFin,
    jour: dispo.jour,
  })
  return `/profs/disponibilites/nouvelle?${params.toString()}`
}