export type {
  Progression,
  CompetenceOption,
  NiveauProgression,
} from './domain/progression.entity'
export type { IProgressionsRepository } from './domain/interfaces/progressions-repository.interface'
import { ajouterProgressionHandler } from './application/commands/ajouter-progression/ajouter-progression.handler'
import {
  useListProgressionsByEleve,
  useListCompetences,
  useAjouterProgression,
} from './application/progressions.hooks'
import { progressionsRepository } from './infrastructure/progressions.repository'
import type { ProgressionViewModel } from './presentation/progression.presenter'
import type { ListBySeanceQuery } from './domain/interfaces/progressions-repository.interface'
import { presentProgression } from './presentation/progression.presenter'
import { ProgressionForm } from '@/components/organisms/o-progression-form'
import { useListProgressionsParSeance } from './application/progressions.hooks'
import { listProgressionsParSeanceHandler } from './application/queries/list-par-seance/list-par-seance.handler'

export type { ProgressionViewModel, ListBySeanceQuery }
export {
  ajouterProgressionHandler,
  listProgressionsParSeanceHandler,
  useListProgressionsByEleve,
  useListProgressionsParSeance,
  useListCompetences,
  useAjouterProgression,
  progressionsRepository,
  presentProgression,
  ProgressionForm,
}