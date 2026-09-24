import { requireProf } from '@/utilities/profAuth'

import NouvelleSeanceView from './NouvelleSeanceView'

export const dynamic = 'force-dynamic'

export default async function NouvelleSeancePage() {
  await requireProf()

  return <NouvelleSeanceView />
}