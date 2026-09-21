'use client'

import { InsetText } from '@/components/atoms'
import { ListeDispos, trierDisponibilites, useListMesDisponibilites } from '@/planning'

export default function DisponibilitesView() {
  const disponibilites = useListMesDisponibilites()

  const dispos = trierDisponibilites(disponibilites.data ?? [])

  if (disponibilites.isLoading) {
    return <p className="lpv-muted">Chargement de vos disponibilités…</p>
  }

  return (
    <>
      <h1 className="lpv-h1">Mes disponibilités</h1>
      <p className="lpv-muted">
        Créneaux hebdomadaires où vous êtes disponible. L&rsquo;association les utilise pour
        planifier les séances.
      </p>

      {dispos.length === 0 ? <InsetText>Aucune disponibilité déclarée.</InsetText> : null}

      <ListeDispos dispos={dispos} />
    </>
  )
}