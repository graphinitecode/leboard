import type { FrequenceSerie, PorteeSerie } from '@/seances/domain/recurrence'

import type { BandeDispo, CibleCreneau, EventCalendrier, MatiereCalendrier } from '../calendrier.entity'

export interface SeancesPeriodeQuery {
  debut: Date
  fin: Date
}

export interface CreerSeanceCommand {
  debut: Date
  dureeMin: number
  matiere: MatiereCalendrier
  eleveIds: number[]
}

export interface DeplacerSeanceCommand {
  seanceId: number
  nouvelleDate: Date
  dureeMin: number
  // Séance d'une série : cette séance, celle-ci et les suivantes, ou toute la série
  portee?: PorteeSerie
}

export interface CreerSerieCommand {
  frequence: FrequenceSerie
  // Première occurrence « YYYY-MM-DD » et heure de début « HH:mm » (heure de Paris)
  premiere: string
  heureDebut: string
  dureeMin: number
  // Dernier jour possible « YYYY-MM-DD », null = jamais
  fin: string | null
  matiere: MatiereCalendrier
  eleveIds: number[]
}

export interface SupprimerSeanceCommand {
  seanceId: number
  portee: PorteeSerie
}

export interface NouvellePastille {
  seanceId: number
  debut: Date
  dureeMin: number
  matiere: MatiereCalendrier
  labelGroupe: string
  href: string
}

export interface ICalendrierRepository {
  listMySeancesPeriode(query: SeancesPeriodeQuery): Promise<EventCalendrier[]>
  listElevesDuProf(): Promise<{ id: number; prenom: string; nom: string; niveau: string }[]>
  creerSeance(command: CreerSeanceCommand): Promise<EventCalendrier | null>
  deplacerSeance(command: DeplacerSeanceCommand): Promise<void>
  creerSerie(command: CreerSerieCommand): Promise<void>
  supprimerSeance(command: SupprimerSeanceCommand): Promise<void>
}

export type { BandeDispo, CibleCreneau, EventCalendrier }