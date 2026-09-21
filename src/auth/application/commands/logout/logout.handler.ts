import { userRepository } from '@/auth/infrastructure/user.repository'

export const logoutHandler = async (): Promise<void> => {
  return userRepository.logout()
}