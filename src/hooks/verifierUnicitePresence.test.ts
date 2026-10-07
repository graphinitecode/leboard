import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { verifierUnicitePresence } from './verifierUnicitePresence'

const reqAvec = (totalDocs: number) => {
  const find = vi.fn().mockResolvedValue({ totalDocs })
  return { find, req: { payload: { find } } as unknown as PayloadRequest }
}

describe('verifierUnicitePresence', () => {
  it('refuse un doublon élève/séance à la création', async () => {
    const { req } = reqAvec(1)

    await expect(verifierUnicitePresence({ data: { eleve: 1, seance: 2 }, req })).resolves.toBe(
      'Présence déjà enregistrée pour cet élève sur cette séance.',
    )
  })

  it('exclut la présence modifiée de la recherche de doublon', async () => {
    const { find, req } = reqAvec(0)

    await expect(
      verifierUnicitePresence({ data: { eleve: 1, seance: 2 }, id: 9, req }),
    ).resolves.toBe(true)

    expect(find.mock.calls[0][0].where.and).toContainEqual({ id: { not_equals: 9 } })
  })
})

describe('Presences — beforeValidate en mise à jour', () => {
  it('accepte un changement de statut (la présence ne se compte pas comme doublon)', async () => {
    const { Presences } = await import('@/collections/Presences')
    const hook = Presences.hooks!.beforeValidate![0]
    // La base ne contient que la présence modifiée : exclue par son id.
    const find = vi.fn(async ({ where }: { where: { and: object[] } }) => ({
      totalDocs: where.and.some((c) => 'id' in c) ? 0 : 1,
    }))
    const req = { payload: { find } } as unknown as PayloadRequest
    const data = { eleve: 1, present: 'absent', seance: 2 }

    await expect(
      hook({ data, operation: 'update', originalDoc: { id: 9, ...data }, req } as never),
    ).resolves.toEqual(data)
  })
})
