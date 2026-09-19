'use client'

import { useTransition } from 'react'

import { ToggleSegmentes, type OptionSegmentee } from '@/components/molecules/ToggleSegmentes'

import { changerPresence } from './actions'

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
  presenceId: number | string
  statutInitial: string
  nomEleve: string
}) {
  return (
    <ToggleSegmentes
      ariaLabel={`Présence de ${nomEleve}`}
      attributData={(option) => ({ 'data-statut': option.value })}
      onChanger={(valeur) => changerPresence(presenceId, valeur)}
      options={OPTIONS}
      valeurInitiale={statutInitial}
    />
  )
}