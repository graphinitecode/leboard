import type { Payload } from 'payload'

import type { Eleve, User } from '@/payload-types'

// Périmètre élève d'un prof (Spec 02 / 10) : ses référents + les élèves de ses séances.
// La clause DB inverse (seances.prof depuis eleves) n'étant pas supportée par l'adapter
// PostgreSQL, le périmètre est composé en code serveur, jamais côté client.
export async function chargerElevesDuProf(
  payload: Payload,
  user: User,
): Promise<Eleve[]> {
  const referents = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    overrideAccess: false,
    sort: 'nom',
    user,
    where: { profReferent: { equals: user.id } },
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 1,
    limit: 0,
    overrideAccess: true,
    select: {
      groupe: true,
    },
    where: { prof: { equals: user.id } },
  })

  const groupeIds = new Set<string>()
  for (const seance of seances.docs) {
    for (const eleve of seance.groupe ?? []) {
      groupeIds.add(String(typeof eleve === 'object' ? eleve.id : eleve))
    }
  }

  const dejaVus = new Set(referents.docs.map((eleve) => String(eleve.id)))
  const idsManquants = Array.from(groupeIds).filter((id) => !dejaVus.has(id))

  const desSeances = idsManquants.length
    ? await payload.find({
        collection: 'eleves',
        depth: 0,
        limit: 0,
        overrideAccess: true,
        sort: 'nom',
        where: { id: { in: idsManquants } },
      })
    : { docs: [] as Eleve[] }

  const parId = new Map<string, Eleve>()
  for (const eleve of [...referents.docs, ...desSeances.docs]) {
    parId.set(String(eleve.id), eleve)
  }

  return Array.from(parId.values()).sort((a, b) => a.nom.localeCompare(b.nom))
}