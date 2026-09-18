import type { Access } from 'payload'

import { isAdmin } from './roles'

// Un prof lit/écrit les progressions de ses élèves :
// - élèves dont il est référent (champ profReferent dupliqué sur la progression
//   au beforeChange — requêtage direct sans join, cf. Spec 02)
// - élèves de ses séances (via la relation seance)
export const progressionsRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      or: [
        { profReferent: { equals: user.id } },
        { 'seance.prof': { equals: user.id } },
      ],
    } as never
  }
  return false
}

export const progressionsWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      or: [
        { profReferent: { equals: user.id } },
        { 'seance.prof': { equals: user.id } },
      ],
    } as never
  }
  return false
}

export const progressionsDelete: Access = ({ req: { user } }) => isAdmin(user)