import type { NiveauProgression } from '@/progressions/domain/progression.entity'
import { progressionsRepository } from '@/progressions/infrastructure/progressions.repository'

export const ajouterProgressionHandler = async (command: {
  eleveId: number
  competenceId: number
  niveau: NiveauProgression
  seanceId?: number
  commentaire?: string
}): Promise<void> => {
  if (!command.eleveId || !command.competenceId || !command.niveau) {
    throw new Error('Élève, compétence et niveau requis.')
  }
  return progressionsRepository.ajouter(command)
}