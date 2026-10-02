export type Matiere = 'maths' | 'francais' | 'anglais' | 'autre'

export type StatutPresence = 'present' | 'absent' | 'absent-justifie'

export interface Seance {
  id: number
  date: string
  matiere: Matiere
  groupeIds: number[]
  profId: number
  /** Durée en minutes (null si non renseignée). */
  duree: number | null
  /** Libellé court du prof (« Claire D. »), null si indéterminé. */
  profLabel: string | null
  retourTexte: string
  aRetour: boolean
}

export interface Presence {
  id: number
  seanceId: number
  eleveId: number
  present: StatutPresence
}

export interface EleveLigne {
  id: number
  prenom: string
  nom: string
  groupe?: string | null
  niveau?: string | null
}

export interface SeanceDetail {
  seance: Seance
  presences: Presence[]
  elevesDuGroupe: EleveLigne[]
}