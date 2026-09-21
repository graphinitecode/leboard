import type { Eleve } from './domain/eleve.entity'
import { listElevesDuProfHandler } from './application/queries/list-du-prof/list-du-prof.handler'
import { getFicheHandler, listEnfantsDuParentHandler } from './application/queries/get-fiche/get-fiche.handler'
import {
  useListElevesDuProf,
  useGetFicheEleve,
  useListEnfantsDuParent,
  ELEVES_QUERY_KEY,
} from './application/eleves.hooks'
import { elevesRepository } from './infrastructure/eleves.repository'
import { nomEleve } from './domain/eleve.entity'

export type { Eleve }
export {
  listElevesDuProfHandler,
  getFicheHandler,
  listEnfantsDuParentHandler,
  useListElevesDuProf,
  useGetFicheEleve,
  useListEnfantsDuParent,
  ELEVES_QUERY_KEY,
  elevesRepository,
  nomEleve,
}