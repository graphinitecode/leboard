import type { Access, FieldAccess } from 'payload'

import { isAdmin } from './roles'

// Lecture des élèves :
// - admin : tout
// - prof : Where clause sur profReferent ; le périmètre « élèves de ses séances »
//   est appliqué en code serveur (portail profs requête les séances puis le groupe)
//   car une clause DB inverse ou dénormalisée sur Eleves s'est révélée fragile
//   (requêtes relationnelles croisées non supportées par l'adapter PG, Spec 02 §8)
// - benevole-bibliotheque : tout (nécessaire pour gérer les prêts, Spec 04)
// - parent : ses enfants (portail, Spec 06)
export const elevesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'benevole-bibliotheque') return true
  if (user.role === 'prof') {
    return {
      profReferent: {
        equals: user.id,
      },
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