import { notFound } from 'next/navigation'

import { requireProf } from '@/utilities/profAuth'

import SeanceProfView from './SeanceProfView'

export const dynamic = 'force-dynamic'

export default async function SeanceProfPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ eleve?: string }>
}) {
  const { id } = await params
  // ?eleve=<id> : venue depuis l'historique de présence d'une fiche élève —
  // la séance s'ouvre sur le suivi de cet élève.
  const { eleve } = await searchParams
  const eleveFocusId = Number(eleve)
  await requireProf()
  const seanceId = Number(id)

  if (!Number.isFinite(seanceId)) {
    notFound()
  }

  return (
    <SeanceProfView
      eleveFocusId={Number.isFinite(eleveFocusId) && eleveFocusId > 0 ? eleveFocusId : undefined}
      seanceId={seanceId}
    />
  )
}