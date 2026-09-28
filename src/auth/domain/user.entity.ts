export type UserRole = 'admin' | 'prof' | 'benevole-bibliotheque' | 'parent'

export interface User {
  id: number | string
  email: string
  prenom: string
  nom: string
  name: string
  role: UserRole
  telephone?: string | null
  collection: 'users'
}

export interface LoginCommand {
  email: string
  password: string
}

export const createEmptyUser = (): User => ({
  id: '',
  email: '',
  prenom: '',
  nom: '',
  name: '',
  role: 'parent',
  collection: 'users',
})