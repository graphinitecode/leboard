export type NiveauProgression = 'acquis' | 'en-cours' | 'a-revoir'

export interface Progression {
  id: number
  eleveId: number
  competenceId: number
  competenceLabel: string | null
  niveau: NiveauProgression
  date: string
  commentaire: string | null
}

export interface CompetenceOption {
  id: number
  label: string
  matiere: string
}