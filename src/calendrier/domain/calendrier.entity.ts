export type MatiereCalendrier = 'maths' | 'francais' | 'anglais' | 'autre'

// Une séance prête à être affichée sur la grille hebdomadaire.
export interface EventCalendrier {
  id: number
  debut: Date
  dureeMin: number
  matiere: MatiereCalendrier
  labelGroupe: string
  href: string
}

// Créneau hebdomadaire de disponibilité (non daté, répété chaque semaine).
export interface BandeDispo {
  jour: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi'
  heureDebut: string
  heureFin: string
}

// Cible de dépôt ou de clic sur la grille : jour + heure de début.
export interface CibleCreneau {
  jourIndex: number
  heureDebut: string
}

// Vue affichée du calendrier.
export type VueCalendrier = 'semaine' | 'jour' | 'liste'

// Plage sélectionnée au clic-tirer (index de rangée de début inclus → fin exclusive).
export interface PlageSelectionnee {
  jourIndex: number
  rangeeDebut: number
  rangeeFin: number
}

// Préremplissage de l'assistant de création.
export interface BrouillonSeance {
  jourIndex?: number
  heureDebut?: string
  heureFin?: string
}

// Charge utile du drag : identifiant de la séance déplacée.
export interface DragPayload {
  seanceId: number
}