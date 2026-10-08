import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Icon, Tag } from '@/components/atoms'
import { AlertCard } from '@/components/molecules/m-alert-card'
import { EmptyState, Pagination, Table } from '@/components/molecules'
import { buildPaginationItems } from '@/components/molecules/m-pagination'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { DetailPage } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import { PretsEleveCard } from '@/components/organisms/o-prets-eleve-card'
import { requireProf } from '@/utilities/profAuth'
import { ordrePresences, paginerParPage, trierPresences } from '@/utilities/presences'
import type { OrdrePresences } from '@/utilities/presences'
import { niveauLabel, texteLexical } from '@/utilities/rapports'

export const dynamic = 'force-dynamic'

function presenceStatus(statut: string): { color: 'green' | 'yellow' | 'red'; label: string } {
  if (statut === 'present') return { color: 'green', label: 'Présent' }
  if (statut === 'absent-justifie') return { color: 'yellow', label: 'Absent (justifié)' }
  return { color: 'red', label: 'Absent' }
}

const couleurProgression = (niveau: string): 'acquis' | 'en-cours' | 'a-revoir' =>
  niveau === 'acquis' ? 'acquis' : niveau === 'en-cours' ? 'en-cours' : 'a-revoir'

export default async function EleveProfPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string; retour?: string; tri?: string }>
}) {
  const { id } = await params
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  // Origine de navigation (?retour=/profs/bibliotheque/livres/12) : le lien
  // « Retour » renvoie à la liste « Mes élèves » par défaut, ou à l'écran
  // d'où l'utilisateur vient (fiche livre) — chemin interne uniquement
  // (anti open-redirect : doit commencer par « / » mais pas « // »).
  const { page: pageParam, retour: retourParam, tri: triParam } = await searchParams
  const retour =
    retourParam && retourParam.startsWith('/') && !retourParam.startsWith('//')
      ? retourParam
      : '/profs/eleves'
  const retourLabel = retour === '/profs/eleves' ? 'Retour à mes élèves' : 'Retour'

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
    // Séances passées uniquement : les séries pré-créent les présences des
    // séances à venir (« Présent » par défaut), qui fausseraient l'historique
    // et le taux de présence.
    where: {
      and: [{ eleve: { equals: id } }, { 'seance.date': { less_than: new Date().toISOString() } }],
    },
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

  const getType = (taux: number | null ) => {
    if (taux === null) return undefined
    if (taux > 75) return 'success'
    if (taux > 25) return 'warning'
    if (taux < 25) return 'danger'
    return undefined
  }
  const stats: DashboardStat[] = [
    {
      value: taux !== null ? `${taux}%` : '—',
      label: 'Taux de présence',
      type: getType(taux),
    },
    {
      value: alertes?.totalDocs ?? 0,
      label: 'Alerte active',
      type: alertes && alertes.totalDocs > 0 ? 'danger' : 'success',
    },
    {
      value: derniereSeanceLabel(derniereSeance?.date ?? null),
      label: 'Dernière séance',
    },
  ]

  // L'ordre voulu est celui de la date de SÉANCE (récent en premier), comme
  // la Progression et les Retours de séance — createdAt est trompeur, voir
  // utilities/presences. Le paramètre `tri` de l'URL permet d'inverser l'ordre
  // chronologique (clic sur « Date ») ou de trier par matière/statut.
  const ordre = ordrePresences(triParam)
  const docsPresences = trierPresences(presences.docs, ordre)

  // Lot de 10 lignes dans l'historique : pagination en mémoire après le tri
  // voulu (les entêtes de tri gardent leur logique en mémoire).
  const { lignes: presencesPage, page: pageCourante, totalPages } = paginerParPage(
    docsPresences,
    Number(pageParam),
  )

  const lienPage = (page: number): string => {
    const params = new URLSearchParams()
    if (retourParam) params.set('retour', retourParam)
    if (triParam) params.set('tri', triParam)
    if (page > 1) params.set('page', String(page))
    const requete = params.toString()
    return requete ? `/profs/eleves/${id}?${requete}` : `/profs/eleves/${id}`
  }
  const lienTri = (cible: OrdrePresences): string => {
    const params = new URLSearchParams()
    if (retourParam) params.set('retour', retourParam)
    // L'ordre par défaut n'encombre pas l'URL — le lien y ramène aussi.
    if (cible !== 'date-desc') params.set('tri', cible)
    const requete = params.toString()
    return requete ? `/profs/eleves/${id}?${requete}` : `/profs/eleves/${id}`
  }
  const enteteTri = (texte: string, cible: OrdrePresences, actif: boolean, sens?: 'asc' | 'desc'): TableHeadCell => ({
    ariaSort: !actif ? undefined : sens === 'asc' ? 'ascending' : 'descending',
    content: (
      <Link className="lpv-m-table__head-link" href={lienTri(cible)}>
        {texte}
        {actif && sens ? (
          <Icon icon={sens === 'asc' ? 'rivet-icons:arrow-up' : 'rivet-icons:arrow-down'} size={12} />
        ) : null}
      </Link>
    ),
    text: texte,
  })
  const enteteDate: TableHeadCell =
    ordre === 'date-asc'
      ? enteteTri('Date', 'date-desc', true, 'asc')
      : ordre === 'date-desc'
        ? enteteTri('Date', 'date-asc', true, 'desc')
        : enteteTri('Date', 'date-desc', false)

  const presencesHead: TableHeadCell[] = [
    enteteDate,
    enteteTri('Matière', 'matiere', ordre === 'matiere', 'asc'),
    enteteTri('Statut', 'statut', ordre === 'statut', 'asc'),
    { content: <span className="lpv-visually-hidden">Séance</span>, text: 'Séance' },
  ]

  const presencesRows: TableRowCell[][] = presencesPage.map((presence) => {
    const seance = presence.seance as unknown as { date?: string; id?: number; matiere?: string }
    const statut = presenceStatus(presence.present)
    const dateLabel = seance?.date ? new Date(String(seance.date)).toLocaleDateString('fr-FR') : '—'
    return [
      { text: dateLabel },
      { text: seance?.matiere ?? '—' },
      { content: <Tag color={statut.color}>{statut.label}</Tag> },
      {
        // Ouvre la séance sur le suivi de cet élève (statut, motif, notes).
        content: seance?.id ? (
          <Link className="lpv-link-inline" href={`/profs/seances/${seance.id}?eleve=${id}`}>
            Voir<span className="lpv-visually-hidden"> la séance du {dateLabel}</span>
          </Link>
        ) : null,
      },
    ]
  })

  // Carte des prêts : l'action « Rendre » est réservée aux gestionnaires de
  // bibliothèque (admin, bénévole) — un prof ne peut que consulter.
  const peutGererBiblio = user.role === 'admin' || user.role === 'benevole-bibliotheque'
  const peutVoirRapport = user.role === 'admin' || user.role === 'prof'

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
      <PretsEleveCard
        eleveId={Number(id)}
        eleveNom={`${eleve.prenom} ${eleve.nom}`}
        peutGerer={peutGererBiblio}
      />
      {peutVoirRapport ? (
        <section className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Rapport</h3>
          <p>Présences, progression, retours de séance et prêts, sur le trimestre en cours.</p>
          <p>
            <Link className="lpv-link-inline" href={`/profs/rapports/${eleve.id}`}>
              Voir le rapport
            </Link>
          </p>
        </section>
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
      backHref={retour}
      backLabel={retourLabel}
      title={`${eleve.prenom} ${eleve.nom}`}
      caption={`${eleve.niveau}${eleve.groupe ? ` · ${eleve.groupe}` : ''}${referentLabel ? ` — Prof référent : ${referentLabel}` : ''}`}
      stats={stats}
      sections={[
        {
          title: 'Historique de présence',
          action: {
            download: true,
            href: `/profs/export/presences?eleve=${eleve.id}`,
            label: 'Exporter (CSV)',
          },
          children:
            presences.docs.length === 0 ? (
              <EmptyState icon="rivet-icons:check-circle" title="Aucune présence enregistrée" variant="neutral" />
            ) : (
              <>
                <Table caption="" head={presencesHead} rows={presencesRows} />
                {totalPages > 1 && (
                  <Pagination
                    items={buildPaginationItems({
                      currentPage: pageCourante,
                      hrefFor: lienPage,
                      totalPages,
                    })}
                    next={pageCourante < totalPages ? { href: lienPage(pageCourante + 1) } : undefined}
                    previous={pageCourante > 1 ? { href: lienPage(pageCourante - 1) } : undefined}
                  />
                )}
              </>
            ),
        },
        {
          title: 'Progression',
          children:
            progressions.docs.length === 0 ? (
              <EmptyState icon="rivet-icons:note" title="Aucune progression" description="" variant="neutral" />
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
              <EmptyState icon="rivet-icons:chat" title="Aucun retour de séance" variant="neutral" />
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
