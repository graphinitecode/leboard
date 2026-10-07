'use client'

import { ErrorMessage } from '@/components/atoms/a-label'
import { SegmentedToggle, type SegmentedOption } from '@/components/molecules/m-segmented-toggle'
import { useTogglePresence } from '@/seances/application/seances.hooks'

const OPTIONS: SegmentedOption[] = [
  { label: 'Présent', ariaLabel: 'Présent', value: 'present' },
  { label: 'Absent', ariaLabel: 'Absent', value: 'absent' },
  { label: 'Justifié', ariaLabel: 'Absent (justifié)', value: 'absent-justifie' },
]

type Statut = 'present' | 'absent' | 'absent-justifie'

// Toggle à un tap : boutons segmentés LPV Board (cibles ≥ 44 px, aria-pressed,
// état communiqué par couleur + graisse + data-statut — jamais la couleur seule).
// Le statut choisi s'affiche dès le clic (mise à jour optimiste du détail
// de séance) ; un échec d'enregistrement est signalé et le toggle revient
// au statut enregistré.
export function PresenceToggle({
  presenceId,
  initialStatus,
  studentName,
  seanceId,
}: {
  presenceId: number
  initialStatus: string
  studentName: string
  /** Id de la séance : rafraîchit le détail (compteurs) après bascule. */
  seanceId?: number
}) {
  const toggle = useTogglePresence()

  return (
    <div>
      <SegmentedToggle
        ariaLabel={`Présence de ${studentName}`}
        dataAttribute={(option) => ({ 'data-status': option.value })}
        onChange={(value) => toggle.mutate({ presenceId, seanceId, statut: value as Statut })}
        options={OPTIONS}
        initialValue={initialStatus}
      />
      {toggle.isError && (
        <ErrorMessage id={`presence-${presenceId}-erreur`}>
          {`Le statut de ${studentName} n'a pas été enregistré. Réessayez.`}
        </ErrorMessage>
      )}
    </div>
  )
}
