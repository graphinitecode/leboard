import type { CollectionBeforeChangeHook, PayloadRequest } from 'payload'

export const PLAFOND_PRETS = 3
export const DUREE_PRET_JOURS = 21

function idDe(relation: unknown): number | string | undefined {
  if (relation == null) return undefined
  if (typeof relation === 'object' && 'id' in relation) return (relation as { id: number }).id
  return relation as number | string
}

export const pretsBeforeChange: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data
  if (!data) return data

  const payload = req.payload
  const exemplaireId = idDe(data.exemplaire)
  const eleveId = idDe(data.eleve)

  // Dates par défaut : emprunt aujourd'hui, retour prévu +21 jours
  if (!data.dateEmprunt) {
    data.dateEmprunt = new Date().toISOString()
  }
  if (!data.dateRetourPrevue) {
    const echeance = new Date()
    echeance.setDate(echeance.getDate() + DUREE_PRET_JOURS)
    data.dateRetourPrevue = echeance.toISOString()
  }

  // 1. L'exemplaire doit exister et être disponible
  if (!exemplaireId) {
    throw new Error('Un exemplaire doit être sélectionné.')
  }

  const exemplaire = await payload.findByID({
    collection: 'exemplaires',
    id: exemplaireId,
    depth: 0,
  })

  if (exemplaire.etat === 'hs') {
    throw new Error('Cet exemplaire est hors service.')
  }

  const pretsOuverts = await payload.find({
    collection: 'prets',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { exemplaire: { equals: exemplaireId } },
        { dateRetourEffective: { equals: null } },
      ],
    },
  })

  if (pretsOuverts.totalDocs > 0) {
    throw new Error('Cet exemplaire est déjà emprunté.')
  }

  // 2. Plafond de prêts simultanés par élève
  if (eleveId) {
    const pretsEleve = await payload.find({
      collection: 'prets',
      depth: 0,
      limit: 0,
      where: {
        and: [{ eleve: { equals: eleveId } }, { dateRetourEffective: { equals: null } }],
      },
    })

    if (pretsEleveAtteintPlafond(pretsEleve.totalDocs)) {
      throw new Error('Limite de prêts simultanés atteinte pour cet élève.')
    }
  }

  return data
}

function pretsEleveAtteintPlafond(total: number): boolean {
  return total >= PLAFOND_PRETS
}

export type { PayloadRequest }