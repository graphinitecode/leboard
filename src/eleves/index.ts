import type { Eleve } from './domain/eleve.entity'
import { listElevesDuProfHandler } from './application/queries/list-du-prof/list-du-prof.handler'
import { useListElevesDuProf, ELEVES_QUERY_KEY } from './application/eleves.hooks'
import { elevesRepository } from './infrastructure/eleves.repository'
import { nomEleve } from './domain/eleve.entity'

export type { Eleve }
export { listElevesDuProfHandler, useListElevesDuProf, ELEVES_QUERY_KEY, elevesRepository, nomEleve }