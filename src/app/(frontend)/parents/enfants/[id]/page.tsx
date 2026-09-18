import { notFound } from 'next/navigation'

import { requireParent } from '@/utilities/parentAuth'
import { getPayloadInstance, verifierParentEleve } from '@/utilities/parentPortal'

export const dynamic = 'force-dynamic'

export default async function EnfantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Séances du groupe (retours du prof)
  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 20,
    where: { groupe: { equals: id } },
    sort: '-date',
  })

  const presentes = presences.docs.filter((p) => p.present === 'present').length
  const taux = presences.totalDocs > 0 ? Math.round((presentes / presences.totalDocs) * 100) : null

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>
        {enfant.prenom} {enfant.nom} <small>({enfant.niveau})</small>
      </h1>

      <section>
        <h2>Présences {taux !== null && `— ${taux}%`}</h2>
        {presences.docs.length === 0 ? (
          <p>Aucune séance enregistrée pour le moment.</p>
        ) : (
          <ul>
            {presences.docs.map((presence) => {
              const seance = presence.seance as unknown as {
                date?: string
                matiere?: string
              }
              return (
                <li key={String(presence.id)}>
                  {seance?.date
                    ? new Date(String(seance.date)).toLocaleDateString('fr-FR')
                    : '—'}{' '}
                  · {seance?.matiere ?? '—'} ·{' '}
                  {presence.present === 'present'
                    ? 'Présent'
                    : presence.present === 'absent-justifie'
                      ? 'Absent (justifié)'
                      : 'Absent'}
                  {presence.commentaire ? ` — ${presence.commentaire}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>Retours de séance</h2>
        {seances.docs.length === 0 ? (
          <p>Aucun retour pour le moment.</p>
        ) : (
          seances.docs.map((seance) => (
            <article
              key={String(seance.id)}
              style={{ borderTop: '1px solid #eee', padding: '0.5rem 0' }}
            >
              <strong>
                {new Date(String(seance.date)).toLocaleDateString('fr-FR')} · {seance.matiere}
              </strong>
              {seance.retour ? <div>{renderRetour(seance.retour)}</div> : null}
            </article>
          ))
        )}
      </section>

      <section>
        <h2>Progressions</h2>
        {progressionsDocsVide(progressions.docs.length) ? (
          <p>Aucune progression enregistrée pour le moment.</p>
        ) : (
          <ul>
            {progressions.docs.map((progression) => (
              <li key={String(progression.id)}>
                {new Date(String(progression.date)).toLocaleDateString('fr-FR')} ·{' '}
                {String(
                  (progression.competence as unknown as { label?: string })?.label ?? '—',
                )}{' '}
                — {niveauLabel(progression.niveau)}
                {progression.commentaire ? ` — ${progression.commentaire}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Prêts</h2>
        {prets.docs.length === 0 ? (
          <p>Aucun prêt enregistré.</p>
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
    </main>
  )
}

function progressionsDocsVide(nombre: number): boolean {
  return nombre === 0
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