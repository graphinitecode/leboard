import { notFound } from 'next/navigation'
import { requireProf } from '@/utilities/profAuth'
import ModifierLivreView from './ModifierLivreView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Modifier la fiche — LPV Board' }

// Édition du livre dans le portail : admin et bénévole uniquement
// (les profs sont en lecture seule sur la bibliothèque — Spec 04).
export default async function ModifierLivrePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireProf()
  const { id } = await params

  if (user.role !== 'admin' && user.role !== 'benevole-bibliotheque') {
    notFound()
  }

  const livreId = Number(id)
  if (!Number.isInteger(livreId) || livreId <= 0) {
    return <p className="lpv-muted">Livre introuvable.</p>
  }

  return <ModifierLivreView livreId={livreId} />
}