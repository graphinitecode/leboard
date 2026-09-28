import { requireProf } from '@/utilities/profAuth'
import FicheLivreView from './FicheLivreView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Livre — LPV Board' }

export default async function FicheLivrePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireProf()
  const { id } = await params

  const livreId = Number(id)
  if (!Number.isInteger(livreId) || livreId <= 0) {
    return <p className="lpv-muted">Livre introuvable.</p>
  }

  // Gestion bibliothèque (boutons d'action) : admin et bénévole uniquement.
  const peutGerer = user.role === 'admin' || user.role === 'benevole-bibliotheque'

  return <FicheLivreView livreId={livreId} peutGerer={peutGerer} />
}