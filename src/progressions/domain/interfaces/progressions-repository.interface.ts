import type { CompetenceOption, NiveauProgression, Progression } from '../progression.entity'

export interface ListByEleveQuery {
  eleveId: number
  limite?: number
}

export interface ListBySeanceQuery {
  seanceId: number
  limite?: number
}

export interface AjouterProgressionCommand {
  eleveId: number
  competenceId: number
  niveau: NiveauProgression
  seanceId?: number
  commentaire?: string
}

export interface IProgressionsRepository {
  listByEleve(query: ListByEleveQuery): Promise<Progression[]>
  listBySeance(query: ListBySeanceQuery): Promise<Progression[]>
  ajouter(command: AjouterProgressionCommand): Promise<void>
  listCompetences(): Promise<CompetenceOption[]>
}