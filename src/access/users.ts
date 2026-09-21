import type { Access, PayloadRequest } from 'payload'

import { isAdmin, isParent } from './roles'

// access.admin n'accepte qu'un booléen (pas de Where clause)
type AdminAccess = (args: { req: PayloadRequest }) => boolean

export const usersRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return {
    id: {
      equals: user.id,
    },
  }
}

export const usersCreate: Access = ({ req: { user } }) => isAdmin(user)

export const usersUpdate: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user)) return true
  return {
    id: {
      equals: user.id,
    },
  }
}

export const usersDelete: Access = ({ req: { user } }) => isAdmin(user)

export const usersAdmin: AdminAccess = ({ req: { user } }) => {
  if (!user) return false
  // Les parents n'ont pas accès au panel admin Payload (ils utilisent le portail, Spec 06)
  return !isParent(user)
}