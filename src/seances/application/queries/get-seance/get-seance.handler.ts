import type { SeanceDetail } from '@/seances/domain/seance.entity'
import { seancesRepository } from '@/seances/infrastructure/seances.repository'

export const getSeanceHandler = async ({ id }: { id: number }): Promise<SeanceDetail | null> => {
  return seancesRepository.getDetail({ id })
}