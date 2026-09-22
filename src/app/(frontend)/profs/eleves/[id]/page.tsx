import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { BackLink, Tag, WarningText } from '@/components/atoms'
import { Table } from '@/components/molecules'
import type { TableauHeadCell, TableauRowCell } from '@/components/molecules'
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

  const presencesHead: TableauHeadCell[] = [
    { texte: 'Date' },
    { texte: 'Matière' },
    { texte: 'Statut' },
  ]

  const presencesRows: TableauRowCell[][] = presences.docs.map((presence) => {
    const seance = presence.seance as unknown as { date?: string; matiere?: string }
    const statut = statutPresence(presence.present)
    return [
      { texte: seance?.date ? new Date(String(seance.date)).toLocaleDateString('fr-FR') : '—' },
      { texte: seance?.matiere ?? '—' },
      { contenu: <Tag couleur={statut.couleur}>{statut.libelle}</Tag> },
    ]
  })

  const progressionsHead: TableauHeadCell[] = [
    { texte: 'Date' },
    { texte: 'Compétence' },
    { texte: 'Niveau' },
    { texte: 'Commentaire' },
  ]

  const progressionsRows: TableauRowCell[][] = progressions.docs.map((progression) => {
    const competence = progression.competence as unknown as { label?: string; matiere?: string }
    const niveau = progression.niveau
    const couleur: 'vert' | 'jaune' | 'rouge' =
      niveau === 'acquis' ? 'vert' : niveau === 'en-cours' ? 'jaune' : 'rouge'
    return [
      { texte: new Date(String(progression.date)).toLocaleDateString('fr-FR') },
      { texte: String(competence?.label ?? '—') },
      { contenu: <Tag couleur={couleur}>{niveauLabel(niveau)}</Tag> },
      { texte: progression.commentaire ?? '' },
    ]
  })

  return (
    <>
      <BackLink href="/profs">Tableau de bord</BackLink>
      <h1 className="lpv-h1">
        {eleve.prenom} {eleve.nom} <Tag couleur="bleu">{eleve.niveau}</Tag>
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
            <WarningText key={String(alerte.id)}>
              {alerte.message}{' '}
              <span style={{ color: 'var(--lpv-text-muted)' }}>
                ({new Date(String(alerte.dateCreation)).toLocaleDateString('fr-FR')})
              </span>
            </WarningText>
          ))}
        </section>
      )}

      <section>
        <h2 className="lpv-h2">Présences</h2>
        {presences.docs.length === 0 ? (
          <p className="lpv-muted">Aucune présence enregistrée.</p>
        ) : (
          <Table caption="Présences" head={presencesHead} rows={presencesRows} />
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Progressions</h2>
        {progressions.docs.length === 0 ? (
          <p className="lpv-muted">Aucune progression.</p>
        ) : (
          <Table caption="Progressions" head={progressionsHead} rows={progressionsRows} />
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
