import { redirect } from 'next/navigation'

import { requireProf } from '@/utilities/profAuth'

import ImportView from './ImportView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Importer des livres — LPV Board' }

// Page d'import CSV de livres (scénario examples/import-books.html) :
// gestion (admin et bénévole) uniquement — les profs consultent.
export default async function ImportLivrePage() {
  const user = await requireProf()

  if (user.role !== 'admin' && user.role !== 'benevole-bibliotheque') {
    redirect('/profs/bibliotheque')
  }

  return <ImportView />
}