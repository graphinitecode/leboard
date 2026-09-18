import Link from 'next/link'

import { getMeUserServer } from '@/utilities/parentAuth'

export const dynamic = 'force-dynamic'

export default async function RapportsPage() {
  const user = await getMeUserServer()

  const autorise = user && (user.role === 'admin' || user.role === 'prof')

  if (!autorise) {
    return (
      <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Rapports</h1>
        <p>Accès réservé aux administrateurs et aux profs de l’association.</p>
        <p>
          <Link href="/parents">Espace parents</Link>
        </p>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Rapports élèves</h1>
      <p>
        Le formulaire de génération est disponible dans la version interactive — pour l’instant,
        ouvrez la fiche élève dans l’admin (timeline présences/progressions) ou utilisez l’URL{' '}
        <code>/rapports/[eleveId]?debut=YYYY-MM-DD&amp;fin=YYYY-MM-DD</code>.
      </p>
      <ul>
        <li>Admin : tous les élèves</li>
        <li>Prof : uniquement ses élèves référents ou de ses séances</li>
      </ul>
    </main>
  )
}