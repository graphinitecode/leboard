import { normaliserTexte } from '@/shared/ui/normalize-text'
// Règle de doublon du catalogue : un même ouvrage n'entre pas deux fois.
// Deux niveaux :
// - bloquant — même ISBN (même édition), ou même titre + auteur alors
//   qu'aucun ISBN n'est saisi (rien ne permet de distinguer deux fiches) ;
// - avertissement — même titre + auteur avec un ISBN saisi différent du
//   référencé (probable édition distincte, à la discrétion de l'utilisateur).
// Partagée par le formulaire « Ajouter un livre » (détection à la saisie,
// garde au submit, aperçu CSV) et la garde serveur (hooks Payload) — même
// fonction, mêmes messages, des deux côtés.

export interface SaisieLivre {
  auteur?: null | string
  isbn?: null | string
  titre?: null | string
}

export interface DoublonLivre {
  gravite: 'avertissement' | 'bloquant'
  idLivre: number
  message: string
  titreLivre: string
}

type LivreRef = {
  auteur?: null | string
  id: number
  isbn?: null | string
  titre: null | string
}

/** ISBN sans espaces ni tirets (10-13 chiffres), pour comparer des formats hétérogènes. */
export const compacterIsbn = (valeur: null | string | undefined): string =>
  (valeur ?? '').replace(/[\s-]/g, '')

/**
 * Normalisation « œuvre » pour comparer titre et auteur : insensible à la
 * casse, aux accents, à la ponctuation (apostrophes typographiques, tirets,
 * signes diacritiques) et aux espaces — « L'École » et « l'école » font un.
 */
const normaliserOeuvre = (valeur: string): string =>
  normaliserTexte(valeur).replace(/[^a-z0-9]+/g, '')

export function detecterDoublonCatalogue(
  saisieLivre: SaisieLivre,
  catalogue: LivreRef[],
): DoublonLivre | null {
  const titre = (saisieLivre.titre ?? '').trim()
  if (!titre) return null
  const isbnCompact = compacterIsbn(saisieLivre.isbn)
  const titreNormalise = normaliserOeuvre(titre)
  const auteurNormalise = normaliserOeuvre((saisieLivre.auteur ?? '').trim())

  // 1. ISBN identique : c'est le même livre, quel que soit le titre saisi.
  if (isbnCompact) {
    const memeIsbn = catalogue.find(
      (livre) => compacterIsbn(livre.isbn) === isbnCompact,
    )
    if (memeIsbn) {
      return {
        gravite: 'bloquant',
        idLivre: memeIsbn.id,
        titreLivre: memeIsbn.titre ?? '',
        message: `« ${memeIsbn.titre} » est déjà au catalogue (même ISBN).`,
      }
    }
  }

  // 2. Même titre + même auteur (insensibles à la casse, aux accents et à la
  // ponctuation).
  const memeOeuvre = catalogue.find(
    (livre) =>
      normaliserOeuvre(livre.titre ?? '') === titreNormalise &&
      normaliserOeuvre(livre.auteur ?? '') === auteurNormalise,
  )
  if (!memeOeuvre) return null

  if (!isbnCompact) {
    return {
      gravite: 'bloquant',
      idLivre: memeOeuvre.id,
      titreLivre: memeOeuvre.titre ?? '',
      message: `« ${memeOeuvre.titre} » est déjà au catalogue.`,
    }
  }

  return {
    gravite: 'avertissement',
    idLivre: memeOeuvre.id,
    titreLivre: memeOeuvre.titre ?? '',
    message: `Un livre « ${memeOeuvre.titre} » est déjà au catalogue avec un autre ISBN — s'il s'agit du même ouvrage, ajoutez des exemplaires sur sa fiche.`,
  }
}