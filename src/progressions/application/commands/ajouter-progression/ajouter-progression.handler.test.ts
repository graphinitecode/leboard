import { describe, expect, it, vi } from 'vitest'

import { progressionsRepository } from '@/progressions/infrastructure/progressions.repository'

import { ajouterProgressionHandler } from './ajouter-progression.handler'

describe('ajouterProgressionHandler', () => {
  it('valide les champs requis puis délègue', async () => {
    const spy = vi.spyOn(progressionsRepository, 'ajouter').mockResolvedValue(undefined)

    await expect(
      ajouterProgressionHandler({
        eleveId: 1,
        competenceId: 2,
        niveau: 'acquis',
        seanceId: 3,
      }),
    ).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalledWith({
      eleveId: 1,
      competenceId: 2,
      niveau: 'acquis',
      seanceId: 3,
    })
    spy.mockRestore()
  })

  it('refuse une commande incomplète sans appeler le repository', async () => {
    const spy = vi.spyOn(progressionsRepository, 'ajouter').mockResolvedValue(undefined)

    await expect(
      ajouterProgressionHandler({ eleveId: 0, competenceId: 2, niveau: 'acquis' }),
    ).rejects.toThrow('Élève, compétence et niveau requis.')

    expect(spy).not.toHaveBeenCalled()
  })
})