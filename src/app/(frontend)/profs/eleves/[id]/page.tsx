import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Tag } from '@/components/atoms'
import { AlertCard } from '@/components/molecules/m-alert-card'
import { Table } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { DetailPage } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import { requireProf } from '@/utilities/profAuth'
import { niveauLabel, texteLexical } from '@/utilities/rapports'

export const dynamic = 'force-dynamic'

function presenceStatus(statut: string): { color: 'green' | 'yellow' | 'red'; label: string } {
  if (statut === 'present') return { color: 'green', label: 'Présent' }
  if (statut === 'absent-justifie') return { color: 'yellow', label: 'Absent (justifié)' }
  return { color: 'red', label: 'Absent' }
}

const couleurProgression = (niveau: string): 'acquis' | 'en-cours' | 'a-revoir' =>
  niveau === 'acquis' ? 'acquis' : niveau === 'en-cours' ? 'en-cours' : 'a-revoir'

export default async function EleveProfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

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

  const derniereSeance = seances.docs[0]
  const referent = eleve.profReferent as { prenom?: string; nom?: string } | null | undefined
  const referentLabel = referent?.prenom
    ? `${referent.prenom} ${(referent.nom ?? '').charAt(0)}.`
    : null

  const stats: DashboardStat[] = [
    {
      value: taux !== null ? `${taux}%` : '—',
      label: 'Taux de présence',
      type: taux !== null && taux < 75 ? 'alert' : undefined,
    },
    {
      value: alertes?.totalDocs ?? 0,
      label: 'Alerte active',
      type: alertes && alertes.totalDocs > 0 ? 'alert' : undefined,
    },
    {
      value: derniereSeanceLabel(derniereSeance?.date ?? null),
      label: 'Dernière séance',
    },
  ]

  const presencesHead: TableHeadCell[] = [
    { text: 'Date' },
    { text: 'Matière' },
    { text: 'Statut' },
  ]

  const presencesRows: TableRowCell[][] = presences.docs.map((presence) => {
    const seance = presence.seance as unknown as { date?: string; matiere?: string }
    const statut = presenceStatus(presence.present)
    return [
      { text: seance?.date ? new Date(String(seance.date)).toLocaleDateString('fr-FR') : '—' },
      { text: seance?.matiere ?? '—' },
      { content: <Tag color={statut.color}>{statut.label}</Tag> },
    ]
  })

  const sidebar = (
    <>
      {alertes && alertes.totalDocs > 0 ? (
        <AlertCard titre="Alerte active">
          {alertes.docs.map((alerte) => (
            <p key={String(alerte.id)}>
              <strong>Décrochage</strong>
              <br />
              {alerte.message}
            </p>
          ))}
        </AlertCard>
      ) : null}
      <section className="lpv-t-dashboard-page__aside-card">
        <h3 className="lpv-t-dashboard-page__aside-card__title">Informations</h3>
        <dl className="lpv-m-infolist">
          <dt>Niveau</dt>
          <dd>{eleve.niveau}</dd>
          {eleve.groupe ? (
            <>
              <dt>Groupe</dt>
              <dd>{eleve.groupe}</dd>
            </>
          ) : null}
          {referentLabel ? (
            <>
              <dt>Prof référent</dt>
              <dd>{referentLabel}</dd>
            </>
          ) : null}
          <dt>Inscrit depuis</dt>
          <dd>
            {new Date(String(eleve.createdAt)).toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </dd>
        </dl>
        <p
          style={{
            borderTop: '1px solid var(--lpv-grey-border)',
            color: 'var(--lpv-text-muted)',
            fontSize: '0.8rem',
            marginTop: '0.625rem',
            paddingTop: '0.625rem',
          }}
        >
          Coordonnées des parents et données RGPD visibles par l&apos;administration uniquement.
        </p>
      </section>
    </>
  )

  return (
    <DetailPage
      backHref="/profs/eleves"
      backLabel="Retour à mes élèves"
      title={`${eleve.prenom} ${eleve.nom}`}
      caption={`${eleve.niveau}${eleve.groupe ? ` · ${eleve.groupe}` : ''}${referentLabel ? ` — Prof référent : ${referentLabel}` : ''}`}
      stats={stats}
      sections={[
        {
          title: 'Historique de présence',
          children:
            presences.docs.length === 0 ? (
              <p className="lpv-muted">Aucune présence enregistrée.</p>
            ) : (
              <Table caption="Présences" head={presencesHead} rows={presencesRows} />
            ),
        },
        {
          title: 'Progression',
          children:
            progressions.docs.length === 0 ? (
              <p className="lpv-muted">Aucune progression.</p>
            ) : (
              <div className="lpv-m-progression-list">
                {progressions.docs.map((progression) => {
                  const competence = progression.competence as unknown as { label?: string }
                  const niveau = couleurProgression(progression.niveau)
                  return (
                    <article
                      className={`lpv-m-progression-card lpv-m-progression-card--${niveau}`}
                      key={String(progression.id)}
                    >
                      <p className="lpv-m-progression-card__title">
                        {String(competence?.label ?? '—')} — Niveau : {niveauLabel(progression.niveau)}
                      </p>
                      <div className="lpv-m-progression-card__meta">
                        {new Date(String(progression.date)).toLocaleDateString('fr-FR')}
                        {referentLabel ? ` — ${referentLabel}` : ''}
                      </div>
                      {progression.commentaire ? (
                        <p className="lpv-m-progression-card__comment">{progression.commentaire}</p>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ),
        },
        {
          title: 'Retours de séance',
          children:
            seances.docs.filter((s) => s.retour).length === 0 ? (
              <p className="lpv-muted">Aucun retour.</p>
            ) : (
              seances.docs
                .filter((s) => s.retour)
                .map((s) => (
                  <article
                    key={String(s.id)}
                    style={{ borderBottom: '1px solid var(--lpv-grey-border)', padding: '0.5rem 0' }}
                  >
                    <strong>
                      {new Date(String(s.date)).toLocaleDateString('fr-FR')} · {s.matiere}
                    </strong>
                    <p style={{ whiteSpace: 'pre-line' }}>{texteLexical(s.retour)}</p>
                  </article>
                ))
            ),
        },
      ]}
      sidebar={sidebar}
    />
  )
}

function derniereSeanceLabel(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(String(date)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
