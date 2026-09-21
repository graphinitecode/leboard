import { describe, expect, it, vi } from 'vitest'

import { seancesRepository } from '@/seances/infrastructure/seances.repository'

import { enregistrerRetourHandler } from './enregistrer-retour.handler'

describe('enregistrerRetourHandler', () => {
  it('délègue au repository', async () => {
    const spy = vi
      .spyOn(seancesRepository, 'enregistrerRetour')
      .mockResolvedValue(undefined)

    await expect(enregistrerRetourHandler({ seanceId: 3, retour: 'Bien' })).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalledWith({ seanceId: 3, retour: 'Bien' })
  })
})