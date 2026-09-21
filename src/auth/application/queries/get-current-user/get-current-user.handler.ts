import type { User } from '@/auth/domain/user.entity'
import { userRepository } from '@/auth/infrastructure/user.repository'

export const getCurrentUserHandler = async (): Promise<User | null> => {
  return userRepository.getCurrentUser()
}