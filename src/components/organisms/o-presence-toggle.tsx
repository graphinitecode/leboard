'use client'

import { SegmentedToggle, type SegmentedOption } from '@/components/molecules/m-segmented-toggle'
import { useTogglePresence } from '@/seances/application/seances.hooks'

const OPTIONS: SegmentedOption[] = [
  { label: 'Présent', ariaLabel: 'Présent', value: 'present' },
  { label: 'Absent', ariaLabel: 'Absent', value: 'absent' },
  { label: 'Justifié', ariaLabel: 'Absent (justifié)', value: 'absent-justifie' },
]

// Toggle à un tap : boutons segmentés LPV Board (cibles ≥ 44 px, aria-pressed,
// état communiqué par couleur + graisse + data-statut — jamais la couleur seule).
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
    <SegmentedToggle
      ariaLabel={`Présence de ${studentName}`}
      dataAttribute={(option) => ({ 'data-status': option.value })}
      onChange={(value) =>
        toggle.mutate(
          { presenceId, seanceId, statut: value as 'present' },
          {
            onError: () => undefined,
          },
        )
      }
      options={OPTIONS}
      initialValue={initialStatus}
    />
  )
}