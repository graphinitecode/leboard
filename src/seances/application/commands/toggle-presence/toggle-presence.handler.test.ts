import { describe, expect, it, vi } from 'vitest'

import { seancesRepository } from '@/seances/infrastructure/seances.repository'

import { togglePresenceHandler } from './toggle-presence.handler'

describe('togglePresenceHandler', () => {
  it('délègue au repository avec la bonne commande', async () => {
    const spy = vi.spyOn(seancesRepository, 'togglePresence').mockResolvedValue(undefined)

    await expect(togglePresenceHandler({ presenceId: 7, statut: 'present' })).resolves.toBeUndefined()

    expect(spy).toHaveBeenCalledWith({ presenceId: 7, statut: 'present' })
  })

  it('propage l erreur du repository', async () => {
    vi.spyOn(seancesRepository, 'togglePresence').mockRejectedValue(new Error('Échec'))

    await expect(togglePresenceHandler({ presenceId: 7, statut: 'absent' })).rejects.toThrow('Échec')
  })
})