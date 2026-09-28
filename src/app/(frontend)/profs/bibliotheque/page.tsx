import { requireProf } from '@/utilities/profAuth'

import BibliothequeView from './BibliothequeView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Bibliothèque — LPV Board' }

export default async function BibliothequePage() {
  const user = await requireProf()

  // Gestion (prêt, retour, catalogue) : admin et bénévole uniquement —
  // les profs consultent (Spec 04 : profs lecture seule).
  const peutGerer = user.role === 'admin' || user.role === 'benevole-bibliotheque'

  return <BibliothequeView peutGerer={peutGerer} />
}