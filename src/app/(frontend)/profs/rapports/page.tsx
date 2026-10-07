import Link from 'next/link'

import { requireProf } from '@/utilities/profAuth'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Rapports — LPV Board' }

export default async function RapportsPage() {
  const user = await requireProf()

  if (user.role !== 'admin' && user.role !== 'prof') {
    return (
      <>
        <h1 className="lpv-h1">Rapports</h1>
        <p>Accès réservé aux administrateurs et aux profs de l’association.</p>
        <p>
          <Link className="lpv-link-inline" href="/profs">
            Retour au tableau de bord
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <h1 className="lpv-h1">Rapports élèves</h1>
      <div style={{ maxWidth: '40rem' }}>
        <p className="lpv-muted">
          Un rapport rassemble les présences et la progression d’un élève sur une période.
        </p>
        <p>
          {user.role === 'admin'
            ? 'En tant qu’administrateur, vous pouvez consulter le rapport de tous les élèves.'
            : 'Vous pouvez consulter le rapport de vos élèves référents et des élèves de vos séances.'}
        </p>
        <p>
          <Link className="lpv-a-button" href="/profs/eleves?retour=/profs/rapports">
            Choisir un élève
          </Link>
        </p>
      </div>
    </>
  )
}
