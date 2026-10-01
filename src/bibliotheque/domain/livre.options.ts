// Options partagées des ouvrages : « niveau conseillé » + catégories.
// Source unique pour la collection Payload (admin), le formulaire d'ajout
// (y compris le mapping CSV) et les filtres/labels des vues — les valeurs
// restent ainsi alignées partout.
// Compat données : les valeurs historiques (primaire, lecture…) demeurent
// des options ; les enrichissements s'ajoutent, ils ne remplacent pas.
export interface OptionLivre {
  label: string
  value: string
}

// « Niveau conseillé » d'un ouvrage : du global au fin (paliers du primaire
// repris de la maquette add-livre-form) en plus du primaire étendu.
export const NIVEAUX_LIVRE: OptionLivre[] = [
  { label: 'Maternelle', value: 'maternelle' },
  { label: 'CP – CE2', value: 'cp-ce2' },
  { label: 'CM1 – CM2', value: 'cm1-cm2' },
  { label: 'Primaire', value: 'primaire' },
  { label: 'Collège', value: 'college' },
  { label: 'Lycée', value: 'lycee' },
]

export const CATEGORIES_LIVRE: OptionLivre[] = [
  { label: 'Roman jeunesse', value: 'roman-jeunesse' },
  { label: 'Conte et fable', value: 'conte-fable' },
  { label: 'Bande dessinée', value: 'bande-dessinee' },
  { label: 'Documentaire', value: 'documentaire' },
  { label: 'Lecture', value: 'lecture' },
  { label: 'Méthodologie', value: 'methodologie' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Manuel', value: 'manuel' },
  { label: 'Dictionnaire / Encyclopédie', value: 'dictionnaire' },
  { label: 'Autre', value: 'autre' },
]

// Libellé d'une valeur stockée : null si la valeur est inconnue
// (l'appelant retombe alors sur la valeur brute).
export const labelNiveauLivre = (niveau: null | string | undefined): string | null =>
  NIVEAUX_LIVRE.find((option) => option.value === niveau)?.label ?? null

export const labelCategorieLivre = (categorie: null | string | undefined): string | null =>
  CATEGORIES_LIVRE.find((option) => option.value === categorie)?.label ?? null