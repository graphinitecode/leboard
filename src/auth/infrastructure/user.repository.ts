import type { User as PayloadUser } from '@/payload-types'

import type { User } from '@/auth/domain/user.entity'
import { getAxiosErrorMessage, isAxiosUnauthorized } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type UserResponse = { user: Pick<PayloadUser, 'id' | 'email' | 'name' | 'role' | 'telephone' | 'collection'> }

const mapDtoToUser = (dto: UserResponse['user']): User => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  role: dto.role,
  telephone: dto.telephone ?? null,
  collection: 'users',
})

export const userRepository = {
  async login(command: { email: string; password: string }): Promise<User> {
    try {
      const res = await httpClient.post<UserResponse>('/users/login', command)
      return mapDtoToUser(res.data.user)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Email ou mot de passe incorrect.'))
    }
  },

  async logout(): Promise<void> {
    try {
      await httpClient.post('/users/logout')
    } catch {
      // la déconnexion ne doit jamais bloquer l'utilisateur
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await httpClient.get<UserResponse>('/users/me')
      return mapDtoToUser(res.data.user)
    } catch (err) {
      if (isAxiosUnauthorized(err)) return null
      throw new Error(getAxiosErrorMessage(err, 'Impossible de récupérer la session.'))
    }
  },
}