import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'
import {
  calculerPresencesEleve,
  niveauLabel,
  texteLexical,
  trimestreCourant,
} from '@/utilities/rapports'

import './rapports.css'

export const dynamic = 'force-dynamic'

export default async function RapportElevePage({
  params,
  searchParams,
}: {
  params: Promise<{ eleveId: string }>
  searchParams: Promise<{ debut?: string; fin?: string }>
}) {
  const { eleveId } = await params
  const { debut, fin } = await searchParams

  const user = await requireProf()
  if (user.role !== 'admin' && user.role !== 'prof') {
    return (
      <>
        <h1 className="lpv-h1">Rapports</h1>
        <p>Accès réservé aux administrateurs et aux profs de l’association.</p>
      </>
    )
  }

  const payload = await getPayload({ config: configPromise })

  const eleve = await payload
    .findByID({
      collection: 'eleves',
      id: eleveId,
      depth: 1,
      overrideAccess: true,
    })
    .catch(() => null)

  if (!eleve) {
    notFound()
  }

  // Périmètre prof : référent ou élève de ses séances
  if (user.role === 'prof') {
    const autorise =
      (eleve.profReferent && String(eleve.profReferent) === String(user.id)) ||
      (await payload.find({
        collection: 'seances',
        depth: 0,
        limit: 1,
        where: {
          and: [{ groupe: { equals: eleveId } }, { prof: { equals: user.id } }],
        },
      })).totalDocs > 0

    if (!autorise) {
      notFound()
    }
  }

  const defaut = trimestreCourant()
  const periodeDebut = debut ? new Date(debut) : defaut.debut
  const periodeFin = fin ? new Date(fin) : defaut.fin

  const presences = await calculerPresencesEleve(payload, eleveId, periodeDebut, periodeFin)

  const progressions = await payload.find({
    collection: 'progressions',
    depth: 1,
    limit: 0,
    sort: '-date',
    where: {
      and: [
        { eleve: { equals: eleveId } },
        { date: { greater_than_equal: periodeDebut.toISOString() } },
        { date: { less_than_equal: periodeFin.toISOString() } },
      ],
    },
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 0,
    sort: '-date',
    where: {
      and: [
        { groupe: { equals: eleveId } },
        { date: { greater_than_equal: periodeDebut.toISOString() } },
        { date: { less_than_equal: periodeFin.toISOString() } },
      ],
    },
  })

  const prets = await payload.find({
    collection: 'prets',
    depth: 1,
    limit: 0,
    sort: '-createdAt',
    where: { eleve: { equals: eleveId } },
  })

  const referent = eleve.profReferent as unknown as { name?: string } | null

  return (
    <div className="rapport" style={{ maxWidth: 720 }}>
      <p>
        <Link className="lpv-link-inline" href="/profs/rapports">
          ← Retour aux rapports
        </Link>
      </p>

      <header>
        <h1>
          {eleve.prenom} {eleve.nom} <small>({eleve.niveau})</small>
        </h1>
        <p>
          Groupe : {eleve.groupe ?? '—'} · Référent : {referent?.name ?? '—'}
          <br />
          Période : {periodeDebut.toLocaleDateString('fr-FR')} →{' '}
          {periodeFin.toLocaleDateString('fr-FR')} · généré le{' '}
          {new Date().toLocaleDateString('fr-FR')}
        </p>
      </header>

      <section>
        <h2>Présence</h2>
        {presences.taux === null ? (
          <p>Aucune séance sur cette période.</p>
        ) : (
          <p>
            Taux de présence : <strong>{presences.taux}%</strong> ({presences.presentes}/
            {presences.attendues}) · {presences.absences} absence(s) (dont{' '}
            {presences.absencesJustifiees} justifiée(s))
          </p>
        )}
      </section>

      <section>
        <h2>Progressions</h2>
        {progressions.docs.length === 0 ? (
          <p>Aucune progression sur cette période.</p>
        ) : (
          <ul>
            {progressions.docs.map((progression) => (
              <li key={String(progression.id)}>
                {new Date(String(progression.date)).toLocaleDateString('fr-FR')} ·{' '}
                {progression.matiere ?? '—'} ·{' '}
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
          <p>Aucun retour de séance sur cette période.</p>
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

      <section>
        <h2>Prêts</h2>
        {prets.docs.length === 0 ? (
          <p>Aucun prêt.</p>
        ) : (
          <ul>
            {prets.docs.map((pret) => (
              <li key={String(pret.id)}>
                {pret.dateRetourEffective
                  ? `Retourné le ${new Date(String(pret.dateRetourEffective)).toLocaleDateString('fr-FR')}`
                  : `En cours — retour prévu le ${new Date(String(pret.dateRetourPrevue)).toLocaleDateString('fr-FR')}`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <small>Document interne — ne pas diffuser · LPV Board</small>
      </footer>
    </div>
  )
}