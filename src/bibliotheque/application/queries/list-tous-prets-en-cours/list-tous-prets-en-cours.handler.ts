import type { Pret } from '@/bibliotheque/domain/pret.entity'
import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const listTousPretsEnCoursHandler = async (): Promise<Pret[]> => {
  return bibliothequeRepository.listTousPretsEnCours()
}