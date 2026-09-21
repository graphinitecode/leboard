import type { User } from '@/auth/domain/user.entity'

export interface UserViewModel {
  id: number | string
  email: string
  fullName: string
  roleLabel: string
  isProf: boolean
  isAdmin: boolean
  isParent: boolean
}

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  prof: 'Professeur',
  'benevole-bibliotheque': 'Bénévole bibliothèque',
  parent: 'Parent',
}

export const presentUser = (user: User): UserViewModel => ({
  id: user.id,
  email: user.email,
  fullName: user.name,
  roleLabel: roleLabels[user.role] ?? user.role,
  isProf: user.role === 'prof' || user.role === 'admin',
  isAdmin: user.role === 'admin',
  isParent: user.role === 'parent',
})