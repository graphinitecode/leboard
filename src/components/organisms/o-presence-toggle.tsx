'use client'

import { ToggleSegmentes, type OptionSegmentee } from '@/components/molecules/m-segmented-toggle'
import { useTogglePresence } from '@/seances/application/seances.hooks'

const OPTIONS: OptionSegmentee[] = [
  { label: 'Présent', libelle: 'Présent', value: 'present' },
  { label: 'Absent', libelle: 'Absent', value: 'absent' },
  { label: 'Justifié', libelle: 'Absent (justifié)', value: 'absent-justifie' },
]

// Toggle à un tap : boutons segmentés LPV Board (cibles ≥ 44 px, aria-pressed,
// état communiqué par couleur + graisse + data-statut — jamais la couleur seule).
export function TogglePresence({
  presenceId,
  statutInitial,
  nomEleve,
}: {
  presenceId: number
  statutInitial: string
  nomEleve: string
}) {
  const toggle = useTogglePresence()

  return (
    <ToggleSegmentes
      ariaLabel={`Présence de ${nomEleve}`}
      attributData={(option) => ({ 'data-statut': option.value })}
      onChanger={(valeur) =>
        toggle.mutate(
          { presenceId, statut: valeur as 'present' },
          {
            onError: () => undefined,
          },
        )
      }
      options={OPTIONS}
      valeurInitiale={statutInitial}
    />
  )
}