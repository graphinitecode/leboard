import type { Seance } from '@/seances/domain/seance.entity'
import { seancesRepository } from '@/seances/infrastructure/seances.repository'

export const listMySeancesHandler = async ({ limite = 30 } = {}): Promise<Seance[]> => {
  return seancesRepository.listMy({ limite })
}