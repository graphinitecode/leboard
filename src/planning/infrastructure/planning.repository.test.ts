import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock du httpClient AVANT l'import du repository
vi.mock('@/shared/infrastructure/http.client', () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

import { httpClient } from '@/shared/infrastructure/http.client'
import { planningRepository } from '@/planning/infrastructure/planning.repository'

const mockedGet = vi.mocked(httpClient.get)
const mockedPatch = vi.mocked(httpClient.patch)

describe('planningRepository (shape de /users/me)', () => {
  beforeEach(() => {
    mockedGet.mockReset()
    mockedPatch.mockReset()
    // GET /api/users/me renvoie un WRAPPER { user, ... } — c'est la cause du bug :
    // un type sans wrapper faisait lire me.data.id (undefined) → PATCH /users/undefined
    mockedGet.mockResolvedValue({
      data: {
        user: {
          id: 7,
          disponibilites: [{ jour: 'lundi', heureDebut: '10:00', heureFin: '12:00' }],
        },
      },
    } as never)
  })

  it('listMesDisponibilites lit les dispos dans res.data.user', async () => {
    const dispos = await planningRepository.listMesDisponibilites()
    expect(dispos).toEqual([{ jour: 'lundi', heureDebut: '10:00', heureFin: '12:00' }])
  })

  it('ajouterDisponibilite PATCHe /users/7 et non /users/undefined', async () => {
    mockedPatch.mockResolvedValue({ data: {} } as never)
    await planningRepository.ajouterDisponibilite({ jour: 'mardi', heureDebut: '14:00', heureFin: '16:00' })
    expect(mockedPatch).toHaveBeenCalledWith('/users/7', expect.anything())
    expect(mockedPatch).not.toHaveBeenCalledWith('/users/undefined', expect.anything())
  })

  it('echoue proprement si le user est deconnecte (user null)', async () => {
    mockedGet.mockResolvedValue({ data: { user: null } } as never)
    await expect(
      planningRepository.ajouterDisponibilite({ jour: 'mardi', heureDebut: '14:00', heureFin: '16:00' }),
    ).rejects.toThrow('Non authentifié.')
    expect(mockedPatch).not.toHaveBeenCalled()
  })
})