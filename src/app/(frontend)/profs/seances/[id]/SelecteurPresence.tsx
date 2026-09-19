'use client'

import { useTransition } from 'react'

import { changerPresence } from './actions'

const STATUTS = [
  { label: 'Présent', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Absent (justifié)', value: 'absent-justifie' },
]

export function SelecteurPresence({
  presenceId,
  statutInitial,
}: {
  presenceId: number | string
  statutInitial: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <select
      disabled={pending}
      defaultValue={statutInitial}
      onChange={(e) => {
        const statut = e.target.value
        startTransition(async () => {
          const result = await changerPresence(presenceId, statut)
          if (!result.ok) {
            alert(result.erreur)
          }
        })
      }}
      style={{ minWidth: 160 }}
    >
      {STATUTS.map(({ label, value }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}