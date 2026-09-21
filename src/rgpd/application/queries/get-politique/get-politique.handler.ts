import type { PolitiqueRgpd } from '@/rgpd/domain/politique.entity'
import { rgpdRepository } from '@/rgpd/infrastructure/rgpd.repository'

export const getPolitiqueHandler = async (): Promise<PolitiqueRgpd | null> => {
  return rgpdRepository.getPolitique()
}