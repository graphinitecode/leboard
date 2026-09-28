import type { User } from '@/auth/domain/user.entity'
import { userRepository } from '@/auth/infrastructure/user.repository'

// Le portail profs est aussi l'interface des bénévoles bibliothèque
// (écran Bibliothèque) : prof, admin et benevole-bibliotheque y accèdent.
const ROLES_PORTAIL = ['prof', 'admin', 'benevole-bibliotheque']

export const loginProfHandler = async (command: {
  email: string
  password: string
}): Promise<User> => {
  const user = await userRepository.login(command)
  if (!ROLES_PORTAIL.includes(user.role)) {
    throw new Error('Accès réservé aux professeurs.')
  }
  return user
}