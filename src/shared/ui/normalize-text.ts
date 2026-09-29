// Normalisation de texte pour la recherche utilisateur : insensible à la
// casse et aux accents (« Léa » → « lea »). Utilisée par les filtres
// type-ahead (combobox) pour matcher une saisie approximative.
export const normaliserTexte = (texte: string): string =>
  texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()