export type { Disponibilite, JourSemaine } from './domain/disponibilite.entity'
export {
  JOURS_SEMAINE,
  trierDisponibilites,
  validerHeures,
} from './domain/disponibilite.entity'
export type { IPlanningRepository } from './domain/interfaces/planning-repository.interface'
import { planningRepository } from './infrastructure/planning.repository'
import {
  listMesDisponibilitesHandler,
  ajouterDisponibiliteHandler,
  supprimerDisponibiliteHandler,
  modifierDisponibiliteHandler,
} from './application/planning.handlers'
import {
  useListMesDisponibilites,
  useAjouterDisponibilite,
  useSupprimerDisponibilite,
  useModifierDisponibilite,
  DISPONIBILITES_QUERY_KEY,
} from './application/planning.hooks'
import { AvailabilityList } from '@/components/organisms/o-availability-list'

export {
  planningRepository,
  listMesDisponibilitesHandler,
  ajouterDisponibiliteHandler,
  supprimerDisponibiliteHandler,
  modifierDisponibiliteHandler,
  useListMesDisponibilites,
  useAjouterDisponibilite,
  useSupprimerDisponibilite,
  useModifierDisponibilite,
  DISPONIBILITES_QUERY_KEY,
  AvailabilityList,
}