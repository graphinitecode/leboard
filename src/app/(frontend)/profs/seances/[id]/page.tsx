import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'

import { FormProgression, FormRetour } from './Formulaires'
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
      user: { collection: 'users', id: user.id } as never,
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
    user: { collection: 'users', id: user.id } as never,
    where: { seance: { equals: id } },
  })

  const competences = await payload.find({
    collection: 'competences',
    depth: 0,
    limit: 0,
    overrideAccess: false,
    sort: 'label',
    user: { collection: 'users', id: user.id } as never,
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
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href="/profs">← Mes séances</Link>
      </p>
      <h1>
        {new Date(String(seance.date)).toLocaleDateString('fr-FR')} · {seance.matiere}
      </h1>

      <section>
        <h2>Présences</h2>
        {groupeIds.length === 0 ? (
          <p>Aucun élève inscrit sur cette séance.</p>
        ) : (
          <ul style={{ display: 'grid', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
            {elevesDuGroupe?.docs.map((eleve) => {
              const presence = presencesParEleve.get(String(eleve.id))
              return (
                <li
                  key={String(eleve.id)}
                  style={{
                    alignItems: 'center',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                  }}
                >
                  <span>
                    <Link href={`/profs/eleves/${eleve.id}`}>{nomEleve(eleve)}</Link>
                  </span>
                  {presence ? (
                    <TogglePresence
                      nomEleve={nomEleve(eleve)}
                      presenceId={presence.id}
                      statutInitial={presence.present}
                    />
                  ) : (
                    <span style={{ color: '#888' }}>Présence non initialisée</span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2>Retour de séance</h2>
        <FormRetour initial={retourTexte} seanceId={id} />
      </section>

      <section>
        <h2>Progressions</h2>
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
    </main>
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