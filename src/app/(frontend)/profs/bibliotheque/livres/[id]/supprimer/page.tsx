import { notFound } from 'next/navigation'
import { requireProf } from '@/utilities/profAuth'
import SupprimerLivreView from './SupprimerLivreView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Supprimer le livre — LPV Board' }

// Retrait du book catalogue : admin et bénévole uniquement (même droit que
// l'édition — les profs sont en lecture seule sur la bibliothèque — Spec 04).
// L'action vit sur sa propre page (pattern GOV.UK pour les actions
// destructives) : les avertissements y expliquent les conséquences.
export default async function SupprimerLivrePage({
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

  return <SupprimerLivreView livreId={livreId} />
}