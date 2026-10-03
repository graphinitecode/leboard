import { notFound } from 'next/navigation'
import Link from 'next/link'

import { BackLink, Tag } from '@/components/atoms'
import { Icon } from '@/components/atoms/a-icon'
import { EmptyState, Table } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { WeekCalendar } from '@/calendrier'
import type { EventCalendrier } from '@/calendrier'
import { matiereFiable } from '@/calendrier/domain/calendrier.utils'
import { requireParent } from '@/utilities/parentAuth'
import { ordrePresences, trierPresences } from '@/utilities/presences'
import type { OrdrePresences } from '@/utilities/presences'
import { getPayloadInstance, verifierParentEleve } from '@/utilities/parentPortal'

export const dynamic = 'force-dynamic'

function statutTexte(statut: string): string {
  if (statut === 'present') return 'Présent'
  if (statut === 'absent-justifie') return 'Absent (justifié)'
  return 'Absent'
}

function niveauLabel(niveau: string): string {
  switch (niveau) {
    case 'acquis':
      return 'Acquis'
    case 'en-cours':
      return 'En cours'
    default:
      return 'À revoir'
  }
}

export default async function EnfantPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ semaine?: string; tri?: string }>
}) {
  const { id } = await params
  const { semaine, tri: triParam } = await searchParams
  const user = await requireParent()
  const payload = await getPayloadInstance()

  const autorise = await verifierParentEleve(payload, user, id)
  if (!autorise) {
    notFound()
  }

  const enfant = await payload.findByID({
    collection: 'eleves',
    id,
    depth: 2,
    overrideAccess: true,
  })

  const presences = await payload.find({
    collection: 'presences',
    depth: 2,
    limit: 50,
    where: { eleve: { equals: id } },
    sort: '-createdAt',
  })

  const prets = await payload.find({
    collection: 'prets',
    depth: 2,
    limit: 20,
    where: { eleve: { equals: id } },
    sort: '-createdAt',
  })

  const progressions = await payload.find({
    collection: 'progressions',
    depth: 1,
    limit: 50,
    where: { eleve: { equals: id } },
    sort: '-date',
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 20,
    where: { groupe: { equals: id } },
    sort: '-date',
  })

  // Semaine affichée : ancre `?semaine=YYYY-MM-DD` sinon semaine courante.
  const ancre = semaine && /^\d{4}-\d{2}-\d{2}$/.test(semaine) ? new Date(`${semaine}T12:00:00`) : new Date()
  const seancesSemaine = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 50,
    sort: 'date',
    where: { groupe: { equals: id } },
  })

  const presentes = presences.docs.filter((p) => p.present === 'present').length
  const taux = presences.totalDocs > 0 ? Math.round((presentes / presences.totalDocs) * 100) : null

  // Ordre d'affichage : date de la séance (récent d'abord) par défaut, avec
  // `?tri=…` pour inverser la chronologie ou trier matière/statut (entêtes
  // cliquables, voir utilities/presences) — createdAt n'est pas la date utile.
  const ordre = ordrePresences(triParam)
  const lienTri = (cible: OrdrePresences): string => {
    const params = new URLSearchParams()
    if (semaine) params.set('semaine', semaine)
    if (cible !== 'date-desc') params.set('tri', cible)
    const requete = params.toString()
    return requete ? `/parents/enfants/${id}?${requete}` : `/parents/enfants/${id}`
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
    { text: 'Commentaire' },
  ]

  const presencesRows: TableRowCell[][] = trierPresences(presences.docs, ordre).map((presence) => {
    const seance = presence.seance as unknown as { date?: string; matiere?: string }
    return [
      { text: seance?.date ? new Date(String(seance.date)).toLocaleDateString('fr-FR') : '—' },
      { text: seance?.matiere ?? '—' },
      { text: statutTexte(presence.present) },
      { text: presence.commentaire ?? '' },
    ]
  })

  const progressionsHead: TableHeadCell[] = [
    { text: 'Date' },
    { text: 'Compétence' },
    { text: 'Niveau' },
  ]

  const progressionsRows: TableRowCell[][] = progressions.docs.map((progression) => {
    const competence = progression.competence as unknown as { label?: string; matiere?: string }
    return [
      { text: new Date(String(progression.date)).toLocaleDateString('fr-FR') },
      { text: String(competence?.label ?? '—') },
      { text: niveauLabel(progression.niveau) },
    ]
  })

  const pretsHead: TableHeadCell[] = [
    { text: 'Statut' },
    { text: 'Date de retour' },
  ]

  const pretsRows: TableRowCell[][] = prets.docs.map((pret) => [
    { text: pret.dateRetourEffective ? 'Retourné' : 'En cours' },
    { text: pret.dateRetourEffective
      ? new Date(String(pret.dateRetourEffective)).toLocaleDateString('fr-FR')
      : pret.dateRetourPrevue
        ? `Prévu le ${new Date(String(pret.dateRetourPrevue)).toLocaleDateString('fr-FR')}`
        : '—' },
  ])

  return (
    <>
      <BackLink href="/parents">Mes enfants</BackLink>
      <h1 className="lpv-h1">
        {enfant.prenom} {enfant.nom} <Tag color="blue">{enfant.niveau}</Tag>
      </h1>

      <section>
        <h2 className="lpv-h2">Cette semaine</h2>
        <WeekCalendar
          events={eventsSemaine(seancesSemaine.docs)}
          mode="parent"
          semaineInitiale={ancre}
        />
      </section>

      <section>
        <h2 className="lpv-h2">Présences {taux !== null && `— ${taux}%`}</h2>
        {presences.docs.length === 0 ? (
          <EmptyState icon="rivet-icons:check-circle" title="Aucune séance enregistrée pour le moment" variant="neutral" />
        ) : (
          <Table caption="Présences" head={presencesHead} rows={presencesRows} />
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Retours de séance</h2>
        {seances.docs.length === 0 ? (
          <EmptyState icon="rivet-icons:chat" title="Aucun retour pour le moment" variant="neutral" />
        ) : (
          seances.docs
            .filter((s) => s.retour)
            .map((seance) => (
              <article key={String(seance.id)} style={{ borderBottom: '1px solid var(--lpv-grey-border)', padding: '0.5rem 0' }}>
                <strong>
                  {new Date(String(seance.date)).toLocaleDateString('fr-FR')} · {seance.matiere}
                </strong>
                <p style={{ whiteSpace: 'pre-line' }}>{renderRetour(seance.retour)}</p>
              </article>
            ))
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Progressions</h2>
        {progressions.docs.length === 0 ? (
          <EmptyState icon="rivet-icons:note" title="Aucune progression enregistrée pour le moment" variant="neutral" />
        ) : (
          <Table caption="Progressions" head={progressionsHead} rows={progressionsRows} />
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Prêts</h2>
        {prets.docs.length === 0 ? (
          <EmptyState icon="boxicons:book" title="Aucun prêt enregistré" variant="neutral" />
        ) : (
          <Table caption="Prêts" head={pretsHead} rows={pretsRows} />
        )}
      </section>
    </>
  )
}

// Convertit les séances du groupe en événements de calendrier (lecture seule).
function eventsSemaine(
  docs: { id: number; date: string; matiere: string; duree?: number | null; groupe?: unknown }[],
): EventCalendrier[] {
  return docs.map((s) => ({
    id: s.id,
    debut: new Date(String(s.date)),
    dureeMin: typeof s.duree === 'number' && s.duree > 0 ? s.duree : 60,
    matiere: matiereFiable(String(s.matiere)),
    labelGroupe: '',
    href: '',
  }))
}

// Extrait le texte brut d'un document lexical (squadJSON)
function renderRetour(retour: unknown): string {
  if (typeof retour === 'string') return retour
  if (!retour || typeof retour !== 'object') return ''

  const root = (retour as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''

  function texte(node: unknown): string {
    if (typeof node === 'string') return node
    if (!node || typeof node !== 'object') return ''
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    return (n.children ?? []).map(texte).join('')
  }

  return root.children.map(texte).filter(Boolean).join('\n')
}
