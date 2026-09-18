import type { CollectionAfterChangeHook } from 'payload'

type EleveRef = number | string | { id: number | string }

export const preCreerPresencesSeance: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const groupe = doc.groupe as EleveRef[] | undefined
  if (!groupe?.length) return doc

  const eleveIds = groupe.map((eleve) => (typeof eleve === 'object' ? eleve.id : eleve))

  const existantes = await req.payload.find({
    collection: 'presences',
    depth: 0,
    limit: 0,
    where: {
      and: [{ seance: { equals: doc.id } }, { eleve: { in: eleveIds } }],
    },
  })

  const dejaCrees = new Set(existantes.docs.map((presence) => String(presence.eleve)))

  const aCreer = eleveIds.filter((eleveId) => !dejaCrees.has(String(eleveId)))

  for (const eleveId of aCreer) {
    await req.payload.create({
      collection: 'presences',
      data: {
        eleve: eleveId as number,
        present: 'present',
        seance: doc.id,
      },
      req,
    })
  }

  return doc
}