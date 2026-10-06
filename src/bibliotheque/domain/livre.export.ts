import type { LivreCatalogue } from './pret.entity'
import { labelCategorieLivre, labelNiveauLivre } from './livre.options'

// En-tête identique à celle de l'import CSV : un export se réimporte tel quel
export const ENTETE_EXPORT_CATALOGUE = ['titre', 'auteur', 'isbn', 'niveau', 'categorie', 'exemplaires', 'resume']

// Catalogue → lignes CSV (en-tête comprise), livres retirés exclus, triés par
// titre. Niveau et catégorie en libellés lisibles, que l'import reconnaît.
export function lignesExportCatalogue(livres: LivreCatalogue[]): string[][] {
  const lignes = livres
    .filter((livre) => !livre.archived)
    .sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
    .map((livre) => [
      livre.titre,
      livre.auteur ?? '',
      livre.isbn ?? '',
      livre.niveau ? (labelNiveauLivre(livre.niveau) ?? livre.niveau) : '',
      livre.categorie ? (labelCategorieLivre(livre.categorie) ?? livre.categorie) : '',
      String(livre.exemplaires.length),
      livre.resume ?? '',
    ])
  return [ENTETE_EXPORT_CATALOGUE, ...lignes]
}
