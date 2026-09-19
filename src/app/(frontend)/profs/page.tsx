import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'

export const dynamic = 'force-dynamic'

export default async function ProfsAccueil() {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  const maintenant = new Date()
  const debutSemaine = new Date(maintenant)
  debutSemaine.setDate(debutSemaine.getDate() - 7)

  const seances = await payload.find({
    collection: 'seances',
    depth: 1,
    limit: 20,
    sort: '-date',
    where: {
      and: [
        { prof: { equals: user.id } },
        { date: { greater_than_equal: debutSemaine.toISOString() } },
      ],
    },
    overrideAccess: false,
    user: { collection: 'users', id: user.id } as never,
  })

  const eleves = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    where: { profReferent: { equals: user.id } },
    overrideAccess: false,
    user: { collection: 'users', id: user.id } as never,
  })

  const aVenir = seances.docs.filter((s) => new Date(String(s.date)) >= maintenant)
  const passees = seances.docs.filter((s) => new Date(String(s.date)) < maintenant)

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Mes séances</h1>
      <p style={{ float: 'right' }}>
        <Link href="/profs/disponibilites">Mes disponibilités</Link>
      </p>

      <section>
        <h2>À venir</h2>
        {aVenir.length === 0 ? (
          <p>Aucune séance à venir.</p>
        ) : (
          <ul>
            {aVenir.map((seance) => (
              <li key={String(seance.id)}>
                <Link href={`/profs/seances/${seance.id}`}>
                  {new Date(String(seance.date)).toLocaleDateString('fr-FR')} ·{' '}
                  {new Date(String(seance.date)).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  · {seance.matiere}
                </Link>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Mes élèves référents ({eleves.totalDocs})</h2>
        <ul>
          {eleves.docs.map((eleve) => (
            <li key={String(eleve.id)}>
              {eleve.prenom} {eleve.nom} ({eleve.niveau})
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}