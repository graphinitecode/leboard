import type { Pret } from '@/bibliotheque/domain/pret.entity'
import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const listPretsParLivreHandler = async (livreId: number): Promise<Pret[]> => {
  return bibliothequeRepository.listPretsParLivre(livreId)
}