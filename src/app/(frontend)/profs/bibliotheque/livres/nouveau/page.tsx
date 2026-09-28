import { requireProf } from '@/utilities/profAuth'

import NouveauLivreView from './NouveauLivreView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Nouveau livre — LPV Board' }

export default async function NouveauLivrePage() {
  await requireProf()

  return <NouveauLivreView />
}