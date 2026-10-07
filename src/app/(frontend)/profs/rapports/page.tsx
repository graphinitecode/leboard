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
      <p>
        Choisissez un élève dans{' '}
        <Link className="lpv-link-inline" href="/profs/eleves?retour=/profs/rapports">
          la liste des élèves
        </Link>{' '}
        pour ouvrir sa fiche, ou utilisez l’adresse{' '}
        <code>/profs/rapports/[eleveId]?debut=AAAA-MM-JJ&amp;fin=AAAA-MM-JJ</code>.
      </p>
      <ul className="list-disc pl-6">
        <li>Admin : tous les élèves</li>
        <li>Prof : uniquement ses élèves référents ou ceux de ses séances</li>
      </ul>
    </>
  )
}
