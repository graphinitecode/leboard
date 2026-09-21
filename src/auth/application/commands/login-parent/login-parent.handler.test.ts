import { describe, expect, it, vi } from 'vitest'

import { userRepository } from '@/auth/infrastructure/user.repository'
import type { User } from '@/auth/domain/user.entity'

import { loginParentHandler } from './login-parent.handler'

const unParent = (): User => ({
  id: 2,
  email: 'parent@lpv.fr',
  name: 'Parent LPV',
  role: 'parent',
  collection: 'users',
})

describe('loginParentHandler', () => {
  it('délègue au repository et retourne le user', async () => {
    const spy = vi.spyOn(userRepository, 'login').mockResolvedValue(unParent())

    const user = await loginParentHandler({ email: 'parent@lpv.fr', password: 'secret' })

    expect(user.role).toBe('parent')
    expect(spy).toHaveBeenCalledWith({ email: 'parent@lpv.fr', password: 'secret' })
  })

  it('refuse un utilisateur qui n est pas parent', async () => {
    vi.spyOn(userRepository, 'login').mockResolvedValue({ ...unParent(), role: 'prof' })

    await expect(loginParentHandler({ email: 'x@lpv.fr', password: 'secret' })).rejects.toThrow(
      'Accès réservé aux parents.',
    )
  })
})