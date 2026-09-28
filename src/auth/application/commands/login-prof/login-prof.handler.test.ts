import { describe, expect, it, vi } from 'vitest'

import { userRepository } from '@/auth/infrastructure/user.repository'
import type { User } from '@/auth/domain/user.entity'

import { loginProfHandler } from './login-prof.handler'

const unProf = (): User => ({
  id: 1,
  email: 'prof@lpv.fr',
  prenom: 'Prof',
  nom: 'LPV',
  name: 'Prof LPV',
  role: 'prof',
  collection: 'users',
})

describe('loginProfHandler', () => {
  it('délègue au repository et retourne le user', async () => {
    const spy = vi.spyOn(userRepository, 'login').mockResolvedValue(unProf())

    const user = await loginProfHandler({ email: 'prof@lpv.fr', password: 'secret' })

    expect(user.role).toBe('prof')
    expect(spy).toHaveBeenCalledWith({ email: 'prof@lpv.fr', password: 'secret' })
  })

  it('refuse un utilisateur qui n est ni prof ni admin ni benevole', async () => {
    vi.spyOn(userRepository, 'login').mockResolvedValue({ ...unProf(), role: 'parent' })

    await expect(loginProfHandler({ email: 'x@lpv.fr', password: 'secret' })).rejects.toThrow(
      'Accès réservé aux professeurs.',
    )
  })

  it('accepte un benevole bibliotheque (portail bibliotheque)', async () => {
    vi.spyOn(userRepository, 'login').mockResolvedValue({ ...unProf(), role: 'benevole-bibliotheque' })

    const user = await loginProfHandler({ email: 'benevole@lpv.fr', password: 'secret' })

    expect(user.role).toBe('benevole-bibliotheque')
  })
})