import { notFound } from 'next/navigation'

import { requireProf } from '@/utilities/profAuth'

import SupprimerSeanceView from './SupprimerSeanceView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Supprimer la séance — LPV Board' }

// Suppression d'une séance récurrente : page dédiée (pattern GOV.UK des
// actions destructives), la portée et ses conséquences y sont expliquées.
export default async function SupprimerSeancePage({
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

  return <SupprimerSeanceView seanceId={seanceId} />
}
