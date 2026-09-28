import { requireProf } from '@/utilities/profAuth'

import NouvelleDisponibiliteView from './NouvelleDisponibiliteView'

export const dynamic = 'force-dynamic'

export default async function NouvelleDisponibilitePage() {
  await requireProf()

  return <NouvelleDisponibiliteView />
}