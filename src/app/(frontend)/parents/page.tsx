import Link from 'next/link'

import { requireParent } from '@/utilities/parentAuth'
import { getEnfantsDuParent, getPayloadInstance } from '@/utilities/parentPortal'

export const dynamic = 'force-dynamic'

export default async function ParentsAccueil() {
  const user = await requireParent()
  const payload = await getPayloadInstance()
  const enfants = await getEnfantsDuParent(payload, user)

  if (enfants.length === 0) {
    return (
      <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Espace parents</h1>
        <p>Aucun enfant n’est relié à votre compte pour le moment.</p>
        <p>
          <small>Contactez l’association si cela vous semble anormal.</small>
        </p>
      </main>
    )
  }

  // Résumé par enfant : taux de présence, prêts en cours, dernière progression
  const resumes = await Promise.all(
    enfants.map(async (enfant) => {
      const presences = await payload.find({
        collection: 'presences',
        depth: 1,
        limit: 0,
        where: { eleve: { equals: enfant.id } },
        sort: '-createdAt',
      })

      const presentes = presences.docs.filter((p) => p.present === 'present').length
      const taux =
        presences.totalDocs > 0 ? Math.round((presentes / presences.totalDocs) * 100) : null

      const pretsEnCours = await payload.find({
        collection: 'prets',
        depth: 1,
        limit: 10,
        where: {
          and: [{ eleve: { equals: enfant.id } }, { dateRetourEffective: { equals: null } }],
        },
      })

      const dernieresProgressions = await payload.find({
        collection: 'progressions',
        depth: 1,
        limit: 3,
        where: { eleve: { equals: enfant.id } },
        sort: '-date',
      })

      return { enfant, presences: presences.totalDocs, taux, pretsEnCours, dernieresProgressions }
    }),
  )

  return (
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Espace parents</h1>
      {resumes.map(({ enfant, presences, taux, pretsEnCours, dernieresProgressions }) => (
        <section
          key={String(enfant.id)}
          style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '1rem' }}
        >
          <h2>
            {enfant.prenom} {enfant.nom} <small>({enfant.niveau})</small>
          </h2>
          <p>
            Présence :{' '}
            {taux !== null ? `${taux}% (${presences} séances)` : 'Aucune séance enregistrée'}
          </p>
          {pretsEnCours.totalDocs > 0 && (
            <p>
              {pretsEnCours.totalDocs} prêt(s) en cours —{' '}
              {pretsEnCours.docs
                .map(
                  (pret) =>
                    `retour prévu le ${new Date(String(pret.dateRetourPrevue)).toLocaleDateString('fr-FR')}`,
                )
                .join(', ')}
            </p>
          )}
          {dernieresProgressions.docs.length > 0 && (
            <p>
              Dernière progression :{' '}
              {String(
                (dernieresProgressions.docs[0].competence as unknown as { label?: string })?.label ??
                  '—',
              )}{' '}
              ({dernieresProgressions.docs[0].niveau})
            </p>
          )}
          <Link href={`/parents/enfants/${enfant.id}`}>Voir le détail</Link>
        </section>
      ))}
      <p>
        <Link href="/rgpd">Politique de protection des données</Link>
      </p>
    </main>
  )
}