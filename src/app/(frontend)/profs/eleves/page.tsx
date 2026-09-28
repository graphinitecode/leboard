import { requireProf } from '@/utilities/profAuth'

import ElevesView from './ElevesView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mes élèves — LPV Board' }

export default async function ElevesPage() {
  const user = await requireProf()

  return <ElevesView profId={user.id} />
}