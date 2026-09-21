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
import { presentProgression } from './presentation/progression.presenter'
import { FormProgression } from './presentation/components/organisms/FormProgression'

export type { ProgressionViewModel }
export {
  ajouterProgressionHandler,
  useListProgressionsByEleve,
  useListCompetences,
  useAjouterProgression,
  progressionsRepository,
  presentProgression,
  FormProgression,
}