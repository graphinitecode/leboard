import type { LivreCatalogue, Pret } from './domain/pret.entity'
import { listPretsEnCoursHandler } from './application/queries/list-prets-en-cours/list-prets-en-cours.handler'
import { listTousPretsEnCoursHandler } from './application/queries/list-tous-prets-en-cours/list-tous-prets-en-cours.handler'
import { listCatalogueHandler } from './application/queries/list-catalogue/list-catalogue.handler'
import { listPretsParLivreHandler } from './application/queries/list-prets-par-livre/list-prets-par-livre.handler'
import { marquerRetourneHandler } from './application/commands/marquer-retourne/marquer-retourne.handler'
import { enregistrerPretHandler } from './application/commands/enregistrer-pret/enregistrer-pret.handler'
import { creerLivreHandler } from './application/commands/creer-livre/creer-livre.handler'
import { modifierLivreHandler } from './application/commands/modifier-livre/modifier-livre.handler'
import {
  useListPretsEnCours,
  useListTousPretsEnCours,
  useListCatalogue,
  useListPretsParLivre,
  useMarquerRetourne,
  useEnregistrerPret,
  useCreerExemplaire,
  useSupprimerExemplaire,
  useCreerLivre,
  useModifierLivre,
  useRetirerCatalogue,
  PRETS_QUERY_KEY,
  CATALOGUE_QUERY_KEY,
} from './application/bibliotheque.hooks'
import { bibliothequeRepository } from './infrastructure/bibliotheque.repository'
import {
  estPretEnCours,
  exemplairesDisponibles,
  JOURS_RAPPEL,
  joursAvantRetour,
  joursDeRetard,
  statutPret,
  trierParRetour,
} from './domain/pret.entity'
import type { StatutPret } from './domain/pret.entity'
import {
  CATEGORIES_LIVRE,
  labelCategorieLivre,
  labelNiveauLivre,
  NIVEAUX_LIVRE,
} from './domain/livre.options'
import { compacterIsbn, detecterDoublonCatalogue } from './domain/livre.doublon'
import type { LigneImportLivre } from './domain/livre.import'
import { analyserImportLivre } from './domain/livre.import'

export type { Pret, LivreCatalogue, LigneImportLivre, StatutPret }
export {
  CATEGORIES_LIVRE,
  labelCategorieLivre,
  labelNiveauLivre,
  NIVEAUX_LIVRE,
  analyserImportLivre,
  compacterIsbn,
  detecterDoublonCatalogue,
  estPretEnCours,
  exemplairesDisponibles,
  JOURS_RAPPEL,
  joursAvantRetour,
  joursDeRetard,
  statutPret,
  trierParRetour,
  listPretsEnCoursHandler,
  listTousPretsEnCoursHandler,
  listCatalogueHandler,
  listPretsParLivreHandler,
  marquerRetourneHandler,
  enregistrerPretHandler,
  creerLivreHandler,
  modifierLivreHandler,
  useListPretsEnCours,
  useListTousPretsEnCours,
  useListCatalogue,
  useListPretsParLivre,
  useMarquerRetourne,
  useEnregistrerPret,
  useCreerExemplaire,
  useSupprimerExemplaire,
  useCreerLivre,
  useModifierLivre,
  useRetirerCatalogue,
  PRETS_QUERY_KEY,
  CATALOGUE_QUERY_KEY,
  bibliothequeRepository,
}