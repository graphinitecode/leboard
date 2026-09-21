import type { NiveauProgression, Progression } from '@/progressions/domain/progression.entity'

export interface ProgressionViewModel {
  id: number
  competenceLabel: string
  niveauLabel: string
  dateLabel: string
  commentaire: string | null
}

const niveauLabels: Record<NiveauProgression, string> = {
  acquis: 'Acquis',
  'en-cours': 'En cours',
  'a-revoir': 'À revoir',
}

export const presentProgression = (progression: Progression): ProgressionViewModel => ({
  id: progression.id,
  competenceLabel: progression.competenceLabel ?? '—',
  niveauLabel: niveauLabels[progression.niveau] ?? progression.niveau,
  dateLabel: new Date(progression.date).toLocaleDateString('fr-FR'),
  commentaire: progression.commentaire,
})