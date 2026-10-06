import type {
  CreerSeanceCommand,
  CreerSerieCommand,
  DeplacerSeanceCommand,
  SupprimerSeanceCommand,
  ICalendrierRepository,
  SeancesPeriodeQuery,
} from '../domain/interfaces/calendrier-repository.interface'
import { calendrierRepository } from '../infrastructure/calendrier.repository'

export const listMySeancesPeriodeHandler = (repository: ICalendrierRepository) => async (
  query: SeancesPeriodeQuery,
) => repository.listMySeancesPeriode(query)

export const listElevesDuProfHandler = (repository: ICalendrierRepository) => async () =>
  repository.listElevesDuProf()

export const creerSeanceHandler = (repository: ICalendrierRepository) => async (
  command: CreerSeanceCommand,
) => repository.creerSeance(command)

export const deplacerSeanceHandler = (repository: ICalendrierRepository) => async (
  command: DeplacerSeanceCommand,
) => repository.deplacerSeance(command)

export const creerSerieHandler = (repository: ICalendrierRepository) => async (
  command: CreerSerieCommand,
) => repository.creerSerie(command)

export const supprimerSeanceHandler = (repository: ICalendrierRepository) => async (
  command: SupprimerSeanceCommand,
) => repository.supprimerSeance(command)

export const calendrierHandlers = {
  listMySeancesPeriode: listMySeancesPeriodeHandler(calendrierRepository),
  listElevesDuProf: listElevesDuProfHandler(calendrierRepository),
  creerSeance: creerSeanceHandler(calendrierRepository),
  deplacerSeance: deplacerSeanceHandler(calendrierRepository),
  creerSerie: creerSerieHandler(calendrierRepository),
  supprimerSeance: supprimerSeanceHandler(calendrierRepository),
}