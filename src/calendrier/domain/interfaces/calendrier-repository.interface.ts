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
}

export type { BandeDispo, CibleCreneau, EventCalendrier }