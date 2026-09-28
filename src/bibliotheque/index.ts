import type { LivreCatalogue, Pret } from './domain/pret.entity'
import { listPretsEnCoursHandler } from './application/queries/list-prets-en-cours/list-prets-en-cours.handler'
import { listTousPretsEnCoursHandler } from './application/queries/list-tous-prets-en-cours/list-tous-prets-en-cours.handler'
import { listCatalogueHandler } from './application/queries/list-catalogue/list-catalogue.handler'
import { marquerRetourneHandler } from './application/commands/marquer-retourne/marquer-retourne.handler'
import { enregistrerPretHandler } from './application/commands/enregistrer-pret/enregistrer-pret.handler'
import { creerLivreHandler } from './application/commands/creer-livre/creer-livre.handler'
import {
  useListPretsEnCours,
  useListTousPretsEnCours,
  useListCatalogue,
  useMarquerRetourne,
  useEnregistrerPret,
  useCreerLivre,
  PRETS_QUERY_KEY,
  CATALOGUE_QUERY_KEY,
} from './application/bibliotheque.hooks'
import { bibliothequeRepository } from './infrastructure/bibliotheque.repository'
import {
  estPretEnCours,
  exemplairesDisponibles,
  joursDeRetard,
} from './domain/pret.entity'

export type { Pret, LivreCatalogue }
export {
  estPretEnCours,
  exemplairesDisponibles,
  joursDeRetard,
  listPretsEnCoursHandler,
  listTousPretsEnCoursHandler,
  listCatalogueHandler,
  marquerRetourneHandler,
  enregistrerPretHandler,
  creerLivreHandler,
  useListPretsEnCours,
  useListTousPretsEnCours,
  useListCatalogue,
  useMarquerRetourne,
  useEnregistrerPret,
  useCreerLivre,
  PRETS_QUERY_KEY,
  CATALOGUE_QUERY_KEY,
  bibliothequeRepository,
}