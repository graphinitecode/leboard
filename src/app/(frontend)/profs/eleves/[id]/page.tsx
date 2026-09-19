import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'
import { niveauLabel, texteLexical } from '@/utilities/rapports'

export const dynamic = 'force-dynamic'

export default async function EleveProfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  // Lecture via les access rules du prof (Spec 02) : pas de bypass
  const eleve = await payload
    .findByID({
      collection: 'eleves',
      id,
      depth: 0,
      overrideAccess: false,
      user: { collection: 'users', id: user.id } as never,
    })
    .catch(() => null)

  if (!eleve) {
    notFound()
  }

  const presences = await payload.find({
    collection: 'presences',
    depth: 1,
    limit: 0,
    overrideAccess: false,
    sort: '-createdAt',
    user: { collection: 'users', id: user.id } as never,
    where: { eleve: { equals: id } },
  })

  const progressions = await payload.find({
    collection: 'progressions',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    sort: '-date',
    user: { collection: 'users', id: user.id } as never,
    where: { eleve: { equals: id } },
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 30,
    overrideAccess: false,
    sort: '-date',
    user: { collection: 'users', id: user.id } as never,
    where: { groupe: { equals: id } },
  })

  // Alertes décrochage ouvertes — visibles seulement par le prof référent
  const alertes =
    eleve.profReferent && String(eleve.profReferent) === String(user.id)
      ? await payload.find({
          collection: 'alertes',
          depth: 0,
          limit: 10,
          overrideAccess: true,
          where: {
            and: [
              { eleve: { equals: id } },
              { statut: { not_equals: 'traitee' } },
              { type: { equals: 'decrochage' } },
            ],
          },
        })
      : null

  const presentes = presences.docs.filter((p) => p.present === 'present').length
  const taux = presences.totalDocs > 0 ? Math.round((presentes / presences.totalDocs) * 100) : null

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href="/profs">← Tableau de bord</Link>
      </p>
      <h1>
        {eleve.prenom} {eleve.nom} <small>({eleve.niveau})</small>
      </h1>
      {eleve.groupe && <p>Groupe : {eleve.groupe}</p>}

      {alertes && alertes.totalDocs > 0 && (
        <div
          style={{
            background: '#fff4f4',
            border: '1px solid #f3c3c3',
            borderRadius: 8,
            padding: '0.75rem 1rem',
          }}
        >
          <strong>⚠️ Alertes actives</strong>
          <ul style={{ margin: '0.5rem 0 0' }}>
            {alertes.docs.map((alerte) => (
              <li key={String(alerte.id)}>
                {alerte.message} ({new Date(String(alerte.dateCreation)).toLocaleDateString('fr-FR')})
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2>Présence {taux !== null && `— ${taux}%`}</h2>
        {presences.docs.length === 0 ? (
          <p>Aucune présence enregistrée.</p>
        ) : (
          <ul>
            {presences.docs.map((presence) => {
              const seance = presence.seance as unknown as { date?: string; matiere?: string }
              return (
                <li key={String(presence.id)}>
                  {seance?.date ? new Date(String(seance.date)).toLocaleDateString('fr-FR') : '—'}{' '}
                  · {seance?.matiere ?? '—'} ·{' '}
                  {presence.present === 'present'
                    ? 'Présent'
                    : presence.present === 'absent-justifie'
                      ? 'Absent (justifié)'
                      : 'Absent'}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>Progressions</h2>
        {progressions.docs.length === 0 ? (
          <p>Aucune progression.</p>
        ) : (
          <ul>
            {progressions.docs.map((progression) => (
              <li key={String(progression.id)}>
                {new Date(String(progression.date)).toLocaleDateString('fr-FR')} ·{' '}
                {String((progression.competence as unknown as { label?: string })?.label ?? '—')} —{' '}
                {niveauLabel(progression.niveau)}
                {progression.commentaire ? ` — ${progression.commentaire}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Retours de séance</h2>
        {seances.docs.filter((s) => s.retour).length === 0 ? (
          <p>Aucun retour.</p>
        ) : (
          seances.docs
            .filter((s) => s.retour)
            .map((s) => (
              <article key={String(s.id)} style={{ borderTop: '1px solid #eee', padding: '0.5rem 0' }}>
                <strong>
                  {new Date(String(s.date)).toLocaleDateString('fr-FR')} · {s.matiere}
                </strong>
                <p style={{ whiteSpace: 'pre-line' }}>{texteLexical(s.retour)}</p>
              </article>
            ))
        )}
      </section>
    </main>
  )
}