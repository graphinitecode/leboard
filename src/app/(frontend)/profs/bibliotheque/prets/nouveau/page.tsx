import { requireProf } from '@/utilities/profAuth'

import NouveauPretView from './NouveauPretView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Nouveau prêt — LPV Board' }

export default async function NouveauPretPage() {
  const user = await requireProf()

  return <NouveauPretView profId={user.id} />
}