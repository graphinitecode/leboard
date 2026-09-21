export interface Eleve {
  id: number
  prenom: string
  nom: string
  niveau: string
  groupe?: string | null
}

export const nomEleve = (eleve: { prenom: string; nom: string }): string =>
  `${eleve.prenom} ${eleve.nom}`