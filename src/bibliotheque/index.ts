import type { Pret } from './domain/pret.entity'
import { estPretEnCours } from './domain/pret.entity'
import { listPretsEnCoursHandler } from './application/queries/list-prets-en-cours/list-prets-en-cours.handler'
import { useListPretsEnCours, PRETS_QUERY_KEY } from './application/bibliotheque.hooks'
import { bibliothequeRepository } from './infrastructure/bibliotheque.repository'

export type { Pret }
export {
  estPretEnCours,
  listPretsEnCoursHandler,
  useListPretsEnCours,
  PRETS_QUERY_KEY,
  bibliothequeRepository,
}