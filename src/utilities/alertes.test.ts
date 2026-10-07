import type { Payload } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { detecterDecrochage } from './alertes'

// Base simulée : un élève, 4 séances passées où il était présent, et des
// présences de séances futures (pré-créées par une série) plus récentes.
const payloadSimule = () => {
  const passees = [1, 2, 3, 4].map((id) => ({ id }))
  const presences = [
    ...[10, 11, 12, 13].map((seance) => ({ present: 'present', seance })),
    ...passees.map(({ id }) => ({ present: 'present', seance: id })),
  ]
  const create = vi.fn()
  const find = vi.fn(async ({ collection, where }: { collection: string; where?: never }) => {
    if (collection === 'eleves') return { docs: [{ id: 7 }] }
    if (collection === 'seances') return { docs: passees }
    if (collection === 'alertes') return { docs: [], totalDocs: 0 }
    const filtre = JSON.stringify(where)
    const ids = /"in":\[([\d,]+)\]/.exec(filtre)?.[1].split(',').map(Number)
    // Sans filtre sur les séances, la base renvoie d'abord les plus récentes.
    const docs = ids ? presences.filter((p) => ids.includes(p.seance)) : presences.slice(0, 4)
    return { docs, totalDocs: docs.length }
  })
  return { create, payload: { create, find, update: vi.fn() } as unknown as Payload }
}

describe('detecterDecrochage', () => {
  it("ne signale pas un élève présent malgré des présences futures pré-créées", async () => {
    const { create, payload } = payloadSimule()

    await expect(detecterDecrochage(payload)).resolves.toBe(0)
    expect(create).not.toHaveBeenCalled()
  })
})
