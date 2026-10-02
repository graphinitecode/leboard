import type { CollectionAfterChangeHook } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { preCreerPresencesSeance } from './preCreerPresencesSeance'

// Le hook requête les présences existantes via req.payload.find puis crée
// les manquantes via req.payload.create — un stub payload au niveau du req
// suffit à tester la logique.
const appeler = async ({
  operation,
  groupe,
  idsEleveAvecPresence,
}: {
  operation: 'create' | 'update'
  groupe: number[] | { id: number }[] | undefined
  idsEleveAvecPresence: number[]
}) => {
  const find = vi.fn(async () => ({
    docs: idsEleveAvecPresence.map((eleveId) => ({ id: eleveId * 10, eleve: eleveId })),
  }))
  const create = vi.fn(async ({ data }: { data: Record<string, unknown> }) => data)

  const doc = { id: 77, groupe } as unknown as Parameters<CollectionAfterChangeHook>[0]['doc']
  const req = { payload: { find, create } } as unknown as Parameters<CollectionAfterChangeHook>[0]['req']
  const context = { doc, operation, req } as unknown as Parameters<CollectionAfterChangeHook>[0]

  const result = await preCreerPresencesSeance(context)

  return { result, find, create }
}

describe('preCreerPresencesSeance', () => {
  it('à la création : initialise une présence pour chaque élève du groupe', async () => {
    const { create } = await appeler({
      operation: 'create',
      groupe: [1, 2, 3],
      idsEleveAvecPresence: [],
    })

    expect(create).toHaveBeenCalledTimes(3)
    expect(create.mock.calls.map((appel) => appel[0].data)).toEqual([
      { eleve: 1, present: 'present', seance: 77 },
      { eleve: 2, present: 'present', seance: 77 },
      { eleve: 3, present: 'present', seance: 77 },
    ])
  })

  it('à la création : ne duplique pas une présence déjà existante', async () => {
    const { create } = await appeler({
      operation: 'create',
      groupe: [1, 2],
      idsEleveAvecPresence: [1],
    })

    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0]?.[0]?.data).toEqual({ eleve: 2, present: 'present', seance: 77 })
  })

  it('à la mise à jour : crée la présence manqueante quand un élève est ajouté après coup', async () => {
    // Le groupe contient désormais les élèves 1 et 2 ; seul 1 avait une présence.
    const { create } = await appeler({
      operation: 'update',
      groupe: [1, 2],
      idsEleveAvecPresence: [1],
    })

    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0]?.[0]?.data).toEqual({ eleve: 2, present: 'present', seance: 77 })
  })

  it('à la mise à jour sans ajout : ne crée rien', async () => {
    const { create } = await appeler({
      operation: 'update',
      groupe: [1, 2],
      idsEleveAvecPresence: [1, 2],
    })

    expect(create).not.toHaveBeenCalled()
  })

  it('groupe vide ou absent : ne crée rien', async () => {
    const { create: sansGroupe } = await appeler({
      operation: 'create',
      groupe: undefined,
      idsEleveAvecPresence: [],
    })
    const { create: groupeVide } = await appeler({
      operation: 'create',
      groupe: [],
      idsEleveAvecPresence: [],
    })

    expect(sansGroupe).not.toHaveBeenCalled()
    expect(groupeVide).not.toHaveBeenCalled()
  })

  it('gère les références objets (depth populate) dans le groupe', async () => {
    const { create } = await appeler({
      operation: 'update',
      groupe: [{ id: 5 }],
      idsEleveAvecPresence: [],
    })

    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0]?.[0]?.data).toEqual({ eleve: 5, present: 'present', seance: 77 })
  })
})