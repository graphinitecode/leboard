import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { BackLink, InsetText, Tag } from '@/components/atoms'
import { SummaryList } from '@/components/molecules/Listes'
import { requireProf } from '@/utilities/profAuth'
import { niveauLabel, texteLexical } from '@/utilities/rapports'

export const dynamic = 'force-dynamic'

function statutPresence(statut: string): { couleur: 'vert' | 'jaune' | 'rouge'; libelle: string } {
  if (statut === 'present') return { couleur: 'vert', libelle: 'Présent' }
  if (statut === 'absent-justifie') return { couleur: 'jaune', libelle: 'Absent (justifié)' }
  return { couleur: 'rouge', libelle: 'Absent' }
}

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
      user,
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
    user,
    where: { eleve: { equals: id } },
  })

  const progressions = await payload.find({
    collection: 'progressions',
    depth: 1,
    limit: 50,
    overrideAccess: false,
    sort: '-date',
    user,
    where: { eleve: { equals: id } },
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 30,
    overrideAccess: false,
    sort: '-date',
    user,
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
    <>
      <BackLink href="/profs">Tableau de bord</BackLink>
      <h1 className="lpv-h1">
        {eleve.prenom} {eleve.nom} <Tag couleur="violet">{eleve.niveau}</Tag>
      </h1>

      <SummaryList
        items={[
          ...(eleve.groupe ? [{ cle: 'Groupe', valeur: eleve.groupe }] : []),
          { cle: 'Présence', valeur: taux !== null ? `${taux}%` : '—' },
        ]}
      />

      {alertes && alertes.totalDocs > 0 && (
        <section>
          <h2 className="lpv-h2">Alertes actives</h2>
          {alertes.docs.map((alerte) => (
            <InsetText key={String(alerte.id)}>
              <strong style={{ color: 'var(--lpv-red)' }}>⚠ {alerte.message}</strong>
              <span style={{ color: 'var(--lpv-text-muted)' }}>
                {' '}
                ({new Date(String(alerte.dateCreation)).toLocaleDateString('fr-FR')})
              </span>
            </InsetText>
          ))}
        </section>
      )}

      <section>
        <h2 className="lpv-h2">Présences</h2>
        {presences.docs.length === 0 ? (
          <p className="lpv-muted">Aucune présence enregistrée.</p>
        ) : (
          presences.docs.map((presence) => {
            const seance = presence.seance as unknown as { date?: string; matiere?: string }
            const statut = statutPresence(presence.present)
            return (
              <div className="lpv-ligne" key={String(presence.id)}>
                <span>
                  <strong>
                    {seance?.date
                      ? new Date(String(seance.date)).toLocaleDateString('fr-FR')
                      : '—'}
                  </strong>
                  <span style={{ color: 'var(--lpv-text-muted)' }}>
                    {' '}
                    · {seance?.matiere ?? '—'}
                  </span>
                </span>
                <Tag couleur={statut.couleur}>{statut.libelle}</Tag>
              </div>
            )
          })
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Progressions</h2>
        {progressions.docs.length === 0 ? (
          <p className="lpv-muted">Aucune progression.</p>
        ) : (
          progressions.docs.map((progression) => (
            <div className="lpv-ligne" key={String(progression.id)}>
              <span>
                <strong>
                  {String((progression.competence as unknown as { label?: string })?.label ?? '—')}
                </strong>
                <span style={{ color: 'var(--lpv-text-muted)' }}>
                  {' '}
                  · {new Date(String(progression.date)).toLocaleDateString('fr-FR')}
                  {progression.commentaire ? ` — ${progression.commentaire}` : ''}
                </span>
              </span>
              <Tag
                couleur={
                  progression.niveau === 'acquis'
                    ? 'vert'
                    : progression.niveau === 'en-cours'
                      ? 'jaune'
                      : 'rouge'
                }
              >
                {niveauLabel(progression.niveau)}
              </Tag>
            </div>
          ))
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Retours de séance</h2>
        {seances.docs.filter((s) => s.retour).length === 0 ? (
          <p className="lpv-muted">Aucun retour.</p>
        ) : (
          seances.docs
            .filter((s) => s.retour)
            .map((s) => (
              <article key={String(s.id)} style={{ borderBottom: '1px solid var(--lpv-grey-border)', padding: '0.5rem 0' }}>
                <strong>
                  {new Date(String(s.date)).toLocaleDateString('fr-FR')} · {s.matiere}
                </strong>
                <p style={{ whiteSpace: 'pre-line' }}>{texteLexical(s.retour)}</p>
              </article>
            ))
        )}
      </section>
    </>
  )
}