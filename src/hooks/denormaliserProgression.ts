import type { CollectionBeforeChangeHook } from 'payload'

// Duplique le profReferent de l'élève sur la progression et copie la matière
// de la compétence — pour requêter sans join (cf. Spec 02 / Spec 03)
export const denormaliserProgression: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (!data) return data

  if (data.eleve) {
    const eleve = await req.payload.findByID({
      collection: 'eleves',
      id: typeof data.eleve === 'object' ? data.eleve.id : data.eleve,
      depth: 0,
    })
    data.profReferent = eleve.profReferent
  }

  if (data.competence) {
    const competence = await req.payload.findByID({
      collection: 'competences',
      id: typeof data.competence === 'object' ? data.competence.id : data.competence,
      depth: 0,
    })
    data.matiere = competence.matiere
  }

  return data
}