import type { Access, FieldAccess } from 'payload'

import { isAdmin } from './roles'

// Lecture des élèves :
// - admin : tout
// - prof : ses élèves référents + les élèves de ses séances
// - benevole-bibliotheque : tout (nécessaire pour gérer les prêts, Spec 04)
// - parent : ses enfants (portail, Spec 06)
//
// Le périmètre « élèves de ses séances » est porté par le champ dénormalisé
// profsDesSeances (hook beforeChange sur seances — cf. Spec 02, fallback
// dénormalisation : la requête inverse 'seances.prof' n'est pas supportée).
export const elevesRead: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isAdmin(user) || user.role === 'benevole-bibliotheque') return true
  if (user.role === 'prof') {
    return {
      or: [
        { profReferent: { equals: user.id } },
        { profsDesSeances: { equals: user.id } },
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