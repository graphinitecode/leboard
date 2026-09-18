import type { Access } from 'payload'

import { isAdmin } from './roles'

// Catalogue de compétences : géré par l'admin, lisible par les profs.
export const competencesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'admin' || user.role === 'prof'
}

export const competencesWrite: Access = ({ req: { user } }) => isAdmin(user)