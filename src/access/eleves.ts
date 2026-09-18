import type { Access, FieldAccess } from 'payload'

import { isAdmin } from './roles'

// Lecture des élèves :
// - admin : tout
// - prof : ses élèves référents + les élèves de ses séances
// - benevole-bibliotheque : tout (nécessaire pour gérer les prêts, Spec 04)
// - parent : ses enfants (portail, Spec 06)
export const elevesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'benevole-bibliotheque') return true
  if (user.role === 'prof') {
    return {
      or: [
        { profReferent: { equals: user.id } },
        {
          // élèves inscrits à au moins une séance dont ce prof est titulaire
          'seances.prof': { equals: user.id },
        },
      ],
    } as never
  }
  if (user.role === 'parent') {
    return {
      parents: {
        equals: user.id,
      },
    }
  }
  return false
}

export const elevesWrite: Access = ({ req: { user } }) => isAdmin(user)

// Champs sensibles (coordonnées parents, consentement RGPD) : réservés à l'admin.
// Le portail parents (Spec 06) lira ces infos côté serveur avec overrideAccess contrôlé.
export const elevesChampSensible: FieldAccess = ({ req: { user } }) => isAdmin(user)