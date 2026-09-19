import type { CollectionAfterChangeHook, Payload } from 'payload'

type EleveRef = number | string | { id: number | string }
type ProfRef = number | string | { id: number | string }

// Recalcule le champ dénormalisé profsDesSeances sur les élèves de la séance.
// Porte le périmètre « élèves de mes séances » pour elevesRead (Spec 02).
async function synchroProfsDesSeances(payload: Payload, seance: {
  id: number | string
  groupe?: EleveRef[]
  prof?: ProfRef
}) {
  const profId = typeof seance.prof === 'object' ? seance.prof?.id : seance.prof
  if (!profId || !seance.groupe?.length) return

  const eleveIds = seance.groupe.map((eleve) => (typeof eleve === 'object' ? eleve.id : eleve))

  for (const eleveId of eleveIds) {
    const eleve = await payload.findByID({
      collection: 'eleves',
      id: eleveId,
      depth: 0,
      overrideAccess: true,
    })

    const profsExistants = new Set(
      (eleve.profsDesSeances ?? []).map((prof) => String(typeof prof === 'object' ? prof.id : prof)),
    )
    profsExistants.add(String(profId))

    await payload.update({
      collection: 'eleves',
      id: eleveId,
      data: {
        profsDesSeances: Array.from(profsExistants).map((id) => Number(id)),
      },
      depth: 0,
      overrideAccess: true,
    })
  }
}

// Après création/modification d'une séance : propage le prof sur les élèves du groupe.
export const synchroProfsApresSeance: CollectionAfterChangeHook = async ({ doc, req }) => {
  await synchroProfsDesSeances(req.payload, doc)
  return doc
}