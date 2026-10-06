export interface Pret {
  id: number
  eleveId: number
  eleveLabel: string | null
  exemplaireCode: string | null
  livreLabel: string | null
  dateEmprunt: string | null
  dateRetourPrevue: string | null
  dateRetourEffective: string | null
}

export const estPretEnCours = (pret: Pret): boolean => pret.dateRetourEffective === null

export interface LivreCatalogue {
  id: number
  titre: string
  auteur: string | null
  isbn: string | null
  resume: string | null
  editeur: string | null
  niveau: string | null
  categorie: string | null
  archived: boolean
  createdAt: string
  /** Couverture éventuelle : simple adresse web (l'image n'est pas stockée). */
  imageUrl?: null | string
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
// Un prêt est « à rendre bientôt » dans les JOURS_RAPPEL jours précédant son retour prévu
export const JOURS_RAPPEL = 3

export type StatutPret = 'retard' | 'bientot' | 'a-temps'

// Jours restants avant le retour prévu (0 = à rendre aujourd'hui), null sans date
export function joursAvantRetour(dateRetourPrevue: string | null, maintenant = new Date()): number | null {
  if (!dateRetourPrevue) return null
  const prevue = new Date(dateRetourPrevue)
  const jour = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.round((jour(prevue) - jour(maintenant)) / 86_400_000)
}

export function statutPret(pret: Pret, maintenant = new Date()): StatutPret {
  if (joursDeRetard(pret.dateRetourPrevue, maintenant) > 0) return 'retard'
  const restants = joursAvantRetour(pret.dateRetourPrevue, maintenant)
  return restants !== null && restants <= JOURS_RAPPEL ? 'bientot' : 'a-temps'
}

// Du retour le plus urgent au plus lointain ; sans date de retour en dernier
export function trierParRetour(prets: Pret[]): Pret[] {
  return [...prets].sort((a, b) => {
    if (!a.dateRetourPrevue) return b.dateRetourPrevue ? 1 : 0
    if (!b.dateRetourPrevue) return -1
    return a.dateRetourPrevue.localeCompare(b.dateRetourPrevue)
  })
}
