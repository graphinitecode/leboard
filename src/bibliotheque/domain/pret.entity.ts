export interface Pret {
  id: number
  eleveId: number
  eleveLabel: string | null
  exemplaireCode: string | null
  livreLabel: string | null
  dateRetourPrevue: string | null
  dateRetourEffective: string | null
}

export const estPretEnCours = (pret: Pret): boolean => pret.dateRetourEffective === null

export interface LivreCatalogue {
  id: number
  titre: string
  auteur: string | null
  niveau: string | null
  categorie: string | null
  archived: boolean
  exemplaires: {
    id: number
    code: string
    etat: string
    disponible: boolean
  }[]
}

// Nombre d'exemplaires actuellement empruntés (depth 2 : prets en cours connus du dto).
export const exemplairesDisponibles = (livre: LivreCatalogue): number =>
  livre.exemplaires.filter((ex) => ex.disponible).length

export const JOURS_RETARD_MAX = 0

export function joursDeRetard(dateRetourPrevue: string | null, maintenant = new Date()): number {
  if (!dateRetourPrevue) return 0
  const prevue = new Date(dateRetourPrevue)
  const diff = Math.floor((maintenant.getTime() - prevue.getTime()) / 86_400_000)
  return Math.max(0, diff)
}