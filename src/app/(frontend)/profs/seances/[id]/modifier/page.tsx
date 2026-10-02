import { notFound } from 'next/navigation'

import { requireProf } from '@/utilities/profAuth'

import ModifierSeanceView from './ModifierSeanceView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Modifier la séance — LPV Board' }

// Complétion / modification de la séance (retour + présences) — page entière,
// même pattern que livres/[id]/modifier : page serveur avec garde, vue client
// dédiée. La fiche de séance reste en lecture seule.
export default async function ModifierSeancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireProf()
  const seanceId = Number(id)

  if (!Number.isInteger(seanceId) || seanceId <= 0) {
    notFound()
  }

  return <ModifierSeanceView seanceId={seanceId} />
}