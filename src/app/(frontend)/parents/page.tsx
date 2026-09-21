import { requireParent } from '@/utilities/parentAuth'

import ParentsEnfantsView from './ParentsEnfantsView'

export const dynamic = 'force-dynamic'

export default async function ParentsAccueil() {
  const user = await requireParent()

  return <ParentsEnfantsView parentId={Number(user.id)} />
}