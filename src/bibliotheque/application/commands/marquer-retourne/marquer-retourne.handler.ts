import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const marquerRetourneHandler = async (pretId: number): Promise<void> => {
  return bibliothequeRepository.marquerRetourne(pretId)
}