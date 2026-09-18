import type { Payload } from 'payload'

import { dateFinRetention } from './rgpd'
import { DUREE_RETENTION_ANS } from './rgpdConfig'

// Crée l'alerte seulement si aucune alerte du même type/cible n'est ouverte (anti-doublon)
export async function creerAlerteSiInexistante(
  payload: Payload,
  data: {
    type: string
    eleve?: number | string
    pret?: number | string
    message: string
  },
): Promise<void> {
  const existante = await payload.find({
    collection: 'alertes',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { type: { equals: data.type } },
        ...(data.eleve ? [{ eleve: { equals: data.eleve } }] : []),
        { statut: { not_equals: 'traitee' } },
      ],
    },
  })

  if (existante.totalDocs > 0) return

  await payload.create({
    collection: 'alertes',
    data: {
      dateCreation: new Date().toISOString(),
      eleve: data.eleve as number,
      message: data.message,
      statut: 'nouvelle',
      type: data.type as 'rgpd-retention',
    },
    overrideAccess: true,
  })
}

export async function detecterFinRetention(payload: Payload): Promise<number> {
  const eleves = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    where: {
      dateFinAdhesion: {
        not_equals: null,
      },
    },
  })

  const maintenant = new Date()
  let creees = 0

  for (const eleve of eleves.docs) {
    const fin = dateFinRetention(eleve.dateFinAdhesion as string)
    if (!fin || fin > maintenant) continue

    await creerAlerteSiInexistante(payload, {
      eleve: eleve.id,
      message: `Profil à supprimer ou anonymiser (fin d'adhésion le ${new Date(String(eleve.dateFinAdhesion)).toLocaleDateString('fr-FR')} + ${DUREE_RETENTION_ANS} ans). La suppression reste une décision humaine.`,
      type: 'rgpd-retention',
    })
    creees++
  }

  return creees
}