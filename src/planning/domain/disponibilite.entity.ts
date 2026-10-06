export type JourSemaine =
  | 'lundi'
  | 'mardi'
  | 'mercredi'
  | 'jeudi'
  | 'vendredi'
  | 'samedi'
  | 'dimanche'

export interface Disponibilite {
  jour: JourSemaine
  heureDebut: string
  heureFin: string
}

export const JOURS_SEMAINE: JourSemaine[] = [
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
  'dimanche',
]

export const trierDisponibilites = (dispos: Disponibilite[]): Disponibilite[] =>
  [...dispos].sort(
    (a, b) =>
      JOURS_SEMAINE.indexOf(a.jour) - JOURS_SEMAINE.indexOf(b.jour) ||
      a.heureDebut.localeCompare(b.heureDebut),
  )

export const validerHeures = (heureDebut: string, heureFin: string): string | null => {
  if (!/^\d{2}:\d{2}$/.test(heureDebut) || !/^\d{2}:\d{2}$/.test(heureFin)) {
    return 'Les heures doivent être au format HH:mm.'
  }
  if (heureFin <= heureDebut) {
    return 'L’heure de fin doit être après l’heure de début.'
  }
  return null
}