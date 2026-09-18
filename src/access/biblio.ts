import type { Access } from 'payload'

import { isAdmin, isBenevoleBibliotheque } from './roles'

// Bibliothèque : bénévole = CRUD complet, prof = lecture seule, admin = tout.
export const biblioRead: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || isBenevoleBibliotheque(user) || user.role === 'prof'
}

export const biblioWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || isBenevoleBibliotheque(user)
}

export const biblioDelete: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || isBenevoleBibliotheque(user)
}