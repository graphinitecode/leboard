export interface Pret {
  id: number
  eleveId: number
  livreLabel: string | null
  dateRetourPrevue: string | null
  dateRetourEffective: string | null
}

export const estPretEnCours = (pret: Pret): boolean => pret.dateRetourEffective === null