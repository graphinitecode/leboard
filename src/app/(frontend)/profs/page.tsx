import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'

export const dynamic = 'force-dynamic'

export default async function ProfsDashboard() {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  const maintenant = new Date()
  const debutSemaine = new Date(maintenant)
  debutSemaine.setDate(debutSemaine.getDate() - 7)

  const seances = await payload.find({
    collection: 'seances',
    depth: 1,
    limit: 30,
    sort: '-date',
    where: {
      and: [
        { prof: { equals: user.id } },
        { date: { greater_than_equal: debutSemaine.toISOString() } },
      ],
    },
    overrideAccess: false,
    user,
  })

  const eleves = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    where: { profReferent: { equals: user.id } },
    overrideAccess: false,
    user,
  })

  const aVenir = seances.docs
    .filter((s) => new Date(String(s.date)) >= maintenant)
    .sort((a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime())
  const passees = seances.docs.filter((s) => new Date(String(s.date)) < maintenant)

  const aujourdhui = aVenir.filter(
    (s) => new Date(String(s.date)).toDateString() === maintenant.toDateString(),
  )
  const resteSemaine = aVenir.filter(
    (s) => new Date(String(s.date)).toDateString() !== maintenant.toDateString(),
  )

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Tableau de bord</h1>
      <p style={{ float: 'right' }}>
        <Link href="/profs/disponibilites">Mes disponibilités</Link>
      </p>

      <section>
        <h2>Aujourd&rsquo;hui</h2>
        {aujourdhui.length === 0 ? (
          <p>Aucune séance aujourd&rsquo;hui.</p>
        ) : (
          <ul>
            {aujourdhui.map((seance) => (
              <li key={String(seance.id)}>
                <Link href={`/profs/seances/${seance.id}`}>
                  {new Date(String(seance.date)).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {seance.matiere}
                </Link>
                {!seance.retour && (
                  <span style={{ color: 'orange', marginLeft: '0.5rem' }}>⏳ Retour à faire</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Cette semaine</h2>
        {resteSemaine.length === 0 ? (
          <p>Rien d&rsquo;autre cette semaine.</p>
        ) : (
          <ul>
            {resteSemaine.map((seance) => (
              <li key={String(seance.id)}>
                <Link href={`/profs/seances/${seance.id}`}>
                  {new Date(String(seance.date)).toLocaleDateString('fr-FR')} ·{' '}
                  {new Date(String(seance.date)).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {seance.matiere}
                </Link>
                {!seance.retour && (
                  <span style={{ color: 'orange', marginLeft: '0.5rem' }}>⏳ Retour à faire</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Passées récentes</h2>
        {passees.length === 0 ? (
          <p>Aucune séance passée récemment.</p>
        ) : (
          <ul>
            {passees.map((seance) => (
              <li key={String(seance.id)}>
                <Link href={`/profs/seances/${seance.id}`}>
                  {new Date(String(seance.date)).toLocaleDateString('fr-FR')} · {seance.matiere}
                </Link>
                {!seance.retour && (
                  <span style={{ color: 'orange', marginLeft: '0.5rem' }}>⏳ Retour à faire</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Mes élèves ({eleves.totalDocs})</h2>
        {eleves.docs.length === 0 ? (
          <p>Aucun élève référent.</p>
        ) : (
          <ul>
            {eleves.docs.map((eleve) => (
              <li key={String(eleve.id)}>
                <Link href={`/profs/eleves/${eleve.id}`}>
                  {eleve.prenom} {eleve.nom} ({eleve.niveau})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}