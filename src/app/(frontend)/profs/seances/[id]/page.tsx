import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'

import { BackLink, Tag } from '@/components/atoms'
import { FormProgression, FormRetour } from '@/components/organisms/FormulairesSeance'
import { requireProf } from '@/utilities/profAuth'

import { TogglePresence } from './TogglePresence'

export const dynamic = 'force-dynamic'

export default async function SeanceProfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  // Requête bornée au prof (Spec 02) : une séance d'un autre prof = notFound
  const seance = await payload
    .findByID({
      collection: 'seances',
      id,
      depth: 1,
      overrideAccess: false,
      user,
    })
    .catch(() => null)

  if (!seance) {
    notFound()
  }

  const presences = await payload.find({
    collection: 'presences',
    depth: 1,
    limit: 0,
    overrideAccess: false,
    sort: 'createdAt',
    user,
    where: { seance: { equals: id } },
  })

  const competences = await payload.find({
    collection: 'competences',
    depth: 0,
    limit: 0,
    overrideAccess: false,
    sort: 'label',
    user,
  })

  const groupeIds = (seance.groupe ?? []).map((eleve) =>
    typeof eleve === 'object' ? eleve.id : eleve,
  )

  const elevesDuGroupe = groupeIds.length
    ? await payload.find({
        collection: 'eleves',
        depth: 0,
        limit: 0,
        overrideAccess: true,
        sort: 'nom',
        where: { id: { in: groupeIds } },
      })
    : null

  // Présences existantes indexées par élève
  const presencesParEleve = new Map(
    presences.docs.map((presence) => {
      const eleve = presence.eleve as unknown as { id: number | string }
      return [String(eleve.id ?? eleve), presence]
    }),
  )

  function nomEleve(eleve: { prenom: string; nom: string }): string {
    return `${eleve.prenom} ${eleve.nom}`
  }

  const retourTexte = extraireTexte(seance.retour)

  return (
    <>
      <BackLink href="/profs">Tableau de bord</BackLink>
      <h1 className="lpv-h1">
        {new Date(String(seance.date)).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}{' '}
        <Tag couleur="bleu">{seance.matiere}</Tag>
      </h1>

      <section>
        <h2 className="lpv-h2">Présences</h2>
        {groupeIds.length === 0 ? (
          <p className="lpv-muted">Aucun élève inscrit sur cette séance.</p>
        ) : (
          <div>
            {elevesDuGroupe?.docs.map((eleve) => {
              const presence = presencesParEleve.get(String(eleve.id))
              return (
                <div className="lpv-ligne" key={String(eleve.id)}>
                  <span>
                    <a href={`/profs/eleves/${eleve.id}`} style={{ color: 'var(--lpv-blue-dark)', fontWeight: 700 }}>
                      {nomEleve(eleve)}
                    </a>
                  </span>
                  {presence ? (
                    <TogglePresence
                      nomEleve={nomEleve(eleve)}
                      presenceId={presence.id}
                      statutInitial={presence.present}
                    />
                  ) : (
                    <span className="lpv-muted">Présence non initialisée</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Retour de séance</h2>
        <FormRetour initial={retourTexte} seanceId={id} />
      </section>

      <section>
        <h2 className="lpv-h2">Progressions</h2>
        <FormProgression
          competences={competences.docs.map((competence) => ({
            id: competence.id,
            label: competence.label,
            matiere: competence.matiere,
          }))}
          eleves={elevesDuGroupe?.docs.map((eleve) => ({
            id: eleve.id,
            label: nomEleve(eleve),
          })) ?? []}
          seanceId={id}
        />
      </section>
    </>
  )
}

function extraireTexte(retour: unknown): string {
  if (!retour || typeof retour !== 'object') return ''
  const root = (retour as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''

  function texte(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    return (n.children ?? []).map(texte).join('')
  }

  return root.children.map(texte).filter(Boolean).join('\n')
}