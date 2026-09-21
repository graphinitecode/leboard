import { notFound } from 'next/navigation'

import { requireProf } from '@/utilities/profAuth'

import SeanceProfView from './SeanceProfView'

export const dynamic = 'force-dynamic'

export default async function SeanceProfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireProf()
  const seanceId = Number(id)

  if (!Number.isFinite(seanceId)) {
    notFound()
  }

  return <SeanceProfView seanceId={seanceId} />
}