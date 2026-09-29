import { AuthenticationError, LockedAuth } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { verifierMotDePasse } from '@/utilities/sensitive-action'

const user = {
  email: 'prof@lpv.org',
} as unknown as import('@/payload-types').User

function payloadAvecErreur(err: unknown): import('payload').Payload {
  return {
    login: vi.fn().mockRejectedValue(err),
  } as unknown as import('payload').Payload
}

describe('verifierMotDePasse', () => {
  it('retourne ok quand le login reussit', async () => {
    const payload = {
      login: vi.fn().mockResolvedValue({ user }),
    } as unknown as import('payload').Payload

    const resultat = await verifierMotDePasse(payload, user, 'secret')

    expect(resultat).toBe('ok')
    expect(payload.login).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: user.email, password: 'secret' },
    })
  })

  it('retourne mot-de-passe-invalide sur AuthenticationError', async () => {
    const payload = payloadAvecErreur(new AuthenticationError())

    expect(await verifierMotDePasse(payload, user, 'faux')).toBe('mot-de-passe-invalide')
  })

  it('retourne verrouille sur LockedAuth', async () => {
    const payload = payloadAvecErreur(new LockedAuth())

    expect(await verifierMotDePasse(payload, user, 'faux')).toBe('verrouille')
  })

  it('laisse remonter les erreurs inattendues', async () => {
    const payload = payloadAvecErreur(new Error('DB down'))

    await expect(verifierMotDePasse(payload, user, 'secret')).rejects.toThrow('DB down')
  })
})