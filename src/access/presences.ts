import type { Access } from 'payload'

import { isAdmin } from './roles'

// Un prof lit/écrit les présences des séances où il est assigné.
// (requête à travers la relation seance.prof)
export const presencesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      'seance.prof': {
        equals: user.id,
      },
    }
  }
  return false
}

export const presencesWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      'seance.prof': {
        equals: user.id,
      },
    }
  }
  return false
}

export const presencesDelete: Access = ({ req: { user } }) => isAdmin(user)