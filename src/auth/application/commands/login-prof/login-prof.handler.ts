import type { User } from '@/auth/domain/user.entity'
import { userRepository } from '@/auth/infrastructure/user.repository'

export const loginProfHandler = async (command: {
  email: string
  password: string
}): Promise<User> => {
  const user = await userRepository.login(command)
  if (user.role !== 'prof' && user.role !== 'admin') {
    throw new Error('Accès réservé aux professeurs.')
  }
  return user
}