import type { LivreCatalogue } from '@/bibliotheque/domain/pret.entity'
import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const listCatalogueHandler = async (): Promise<LivreCatalogue[]> => {
  return bibliothequeRepository.listCatalogue()
}