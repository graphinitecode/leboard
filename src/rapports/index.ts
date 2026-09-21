import type { StatsPresencesEleve } from './domain/rapport.entity'
import {
  calculerPresencesEleveHandler,
  trimestreCourant,
} from './application/calculer-presences.handler'
import { rapportsRepository } from './infrastructure/rapports.repository'

export type { StatsPresencesEleve }
export { calculerPresencesEleveHandler, trimestreCourant, rapportsRepository }