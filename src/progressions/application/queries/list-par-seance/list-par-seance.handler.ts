import type { Progression } from '@/progressions/domain/progression.entity'
import { progressionsRepository } from '@/progressions/infrastructure/progressions.repository'

export const listProgressionsParSeanceHandler = async ({
  seanceId,
  limite,
}: {
  seanceId: number
  limite?: number
}): Promise<Progression[]> => {
  if (!seanceId) {
    throw new Error('Séance requise.')
  }
  return progressionsRepository.listBySeance({ seanceId, limite })
}