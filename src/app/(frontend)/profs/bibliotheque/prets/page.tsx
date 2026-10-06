import { requireProf } from '@/utilities/profAuth'

import PretsEnCoursView from './PretsEnCoursView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Prêts en cours — LPV Board' }

// Liste complète des prêts en cours. Les profs consultent ; le retour reste
// réservé à l'admin et aux bénévoles de la bibliothèque (Spec 04).
export default async function PretsEnCoursPage() {
  const user = await requireProf()
  const peutGerer = user.role === 'admin' || user.role === 'benevole-bibliotheque'

  return <PretsEnCoursView peutGerer={peutGerer} />
}
