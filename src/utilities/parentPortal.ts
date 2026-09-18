import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'

// Vérifie que l'utilisateur est bien parent de l'élève demandé.
// Toute lecture du portail passe par ici — jamais côté client (Spec 06).
export async function verifierParentEleve(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: User,
  eleveId: number | string,
): Promise<boolean> {
  if (user.role !== 'parent') return false

  const eleves = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 1,
    where: {
      and: [{ id: { equals: eleveId } }, { parents: { equals: user.id } }],
    },
  })

  return eleves.totalDocs > 0
}

export async function getEnfantsDuParent(
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: User,
): Promise<import('@/payload-types').Eleve[]> {
  if (user.role !== 'parent') return []

  const enfants = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    where: {
      parents: {
        equals: user.id,
      },
    },
    overrideAccess: true,
  })

  return enfants.docs
}

export async function getPayloadInstance() {
  return getPayload({ config: configPromise })
}