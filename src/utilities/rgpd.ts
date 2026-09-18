import type { FieldHook, Payload } from 'payload'

import { DUREE_RETENTION_ANS } from './rgpdConfig'

export const setConsentement: FieldHook = async ({ data, operation, value }) => {
  if (operation !== 'create' && operation !== 'update') return value
  if (data?.consentementRGPD) {
    data.dateConsentement = data.dateConsentement ?? new Date().toISOString()
    data.versionConsentement = data.versionConsentement ?? 'v1'
  }
  return value
}

export function estMajeur(dateNaissance: string | Date | undefined | null): boolean {
  if (!dateNaissance) return false
  const naissance = new Date(dateNaissance)
  const maintenant = new Date()
  let age = maintenant.getFullYear() - naissance.getFullYear()
  const mois = maintenant.getMonth() - naissance.getMonth()
  if (mois < 0 || (mois === 0 && maintenant.getDate() < naissance.getDate())) {
    age--
  }
  return age >= 18
}

export function dateFinRetention(dateFinAdhesion: string | Date | undefined): Date | null {
  if (!dateFinAdhesion) return null
  const fin = new Date(dateFinAdhesion)
  fin.setFullYear(fin.getFullYear() + DUREE_RETENTION_ANS)
  return fin
}

export async function anonymiserEleve(
  payload: Payload,
  eleveId: number | string,
  adminId: number | string,
): Promise<void> {
  const eleve = await payload.findByID({
    collection: 'eleves',
    id: eleveId,
    depth: 0,
    overrideAccess: true,
  })

  await payload.update({
    collection: 'eleves',
    id: eleveId,
    data: {
      prenom: `Élève #${eleveId}`,
      nom: `Élève #${eleveId}`,
      dateNaissance: `${new Date(eleve.dateNaissance as string).getFullYear()}-01-01T00:00:00.000Z`,
      parents: [],
      consentementRGPD: false,
      consentementRetire: true,
      dateFinAdhesion: eleve.dateFinAdhesion ?? new Date().toISOString(),
    },
    depth: 0,
    overrideAccess: true,
  })

  // Les présences et progressions restent (données statistiques), sans identité nominative
  await payload.update({
    collection: 'presences',
    where: { eleve: { equals: eleveId } },
    data: { commentaire: '' },
    overrideAccess: true,
  })

  payload.logger.info({
    adminId,
    action: 'anonymisation',
    eleveId,
  })
}