import { requireProf } from '@/utilities/profAuth'
import FicheLivreView from './FicheLivreView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Livre — LPV Board' }

export default async function FicheLivrePage({ params }: { params: Promise<{ id: string }> }) {
  await requireProf()
  const { id } = await params

  const livreId = Number(id)
  if (!Number.isInteger(livreId) || livreId <= 0) {
    return <p className="lpv-muted">Livre introuvable.</p>
  }

  return <FicheLivreView livreId={livreId} />
}