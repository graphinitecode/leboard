import { requireProf } from '@/utilities/profAuth'

import BibliothequeView from './BibliothequeView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Bibliothèque — LPV Board' }

export default async function BibliothequePage() {
  await requireProf()

  return <BibliothequeView />
}