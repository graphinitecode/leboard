import type { Access } from 'payload'

import { isAdmin } from './roles'

// Les profs ne voient et ne modifient que les séances où ils sont assignés.
// parent et benevole-bibliotheque : pas d'accès direct (le portail Spec 06
// exposera les séances des enfants via une route serveur contrôlée).
export const seancesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      prof: {
        equals: user.id,
      },
    }
  }
  return false
}

export const seancesWrite: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  if (user.role === 'prof') {
    return {
      prof: {
        equals: user.id,
      },
    }
  }
  return false
}

export const seancesCreate: Access = ({ req: { user } }) => {
  if (!user) return false
  return isAdmin(user) || user.role === 'prof'
}

export const seancesDelete: Access = ({ req: { user } }) => isAdmin(user)