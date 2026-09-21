import type { Pret } from '@/bibliotheque/domain/pret.entity'
import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const listPretsEnCoursHandler = async (query: { eleveId?: number } = {}): Promise<Pret[]> => {
  return bibliothequeRepository.listPretsEnCours(query)
}