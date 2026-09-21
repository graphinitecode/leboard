import { requireProf } from '@/utilities/profAuth'

import DisponibilitesView from './DisponibilitesView'

export const dynamic = 'force-dynamic'

export default async function DisponibilitesPage() {
  await requireProf()

  return <DisponibilitesView />
}