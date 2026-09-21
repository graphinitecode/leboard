import type { User } from '@/auth/domain/user.entity'
import { userRepository } from '@/auth/infrastructure/user.repository'

export const loginParentHandler = async (command: {
  email: string
  password: string
}): Promise<User> => {
  const user = await userRepository.login(command)
  if (user.role !== 'parent') {
    throw new Error('Accès réservé aux parents.')
  }
  return user
}