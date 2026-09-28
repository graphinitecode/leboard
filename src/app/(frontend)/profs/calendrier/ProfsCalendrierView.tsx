'use client'

import { InsetText } from '@/components/atoms'
import { WeekCalendar } from '@/calendrier'
import { useListMesDisponibilites } from '@/planning'

// Vue du calendrier hebdomadaire interactif du prof : déplacement de
// séances par glisser-déposer, création par clic-tirer, vues Semaine /
// Jour / Liste. Détachée du tableau de bord (refonte du dashboard).
export default function ProfsCalendrierView() {
  const disponibilites = useListMesDisponibilites()

  return (
    <>
      <h1 className="lpv-h1">Calendrier</h1>
      <InsetText>
        Déplacez une séance par glisser-déposer, ou cliquez-tirez sur une case libre pour en créer
        une.
      </InsetText>
      <WeekCalendar dispos={disponibilites.data ?? []} mode="prof" />
    </>
  )
}