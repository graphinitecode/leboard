import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

type AuthedUser = User | undefined | null

export const isAdmin = (user: AuthedUser): boolean => user?.role === 'admin'

export const isProf = (user: AuthedUser): boolean => user?.role === 'prof'

export const isBenevoleBibliotheque = (user: AuthedUser): boolean =>
  user?.role === 'benevole-bibliotheque'

export const isParent = (user: AuthedUser): boolean => user?.role === 'parent'

export const adminOnly: Access = ({ req: { user } }) => isAdmin(user)

export const adminOnlyField: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const authenticated: Access = ({ req: { user } }) => Boolean(user)

export const authenticatedField: FieldAccess = ({ req: { user } }) => Boolean(user)