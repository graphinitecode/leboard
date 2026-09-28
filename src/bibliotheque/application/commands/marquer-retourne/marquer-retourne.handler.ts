import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const marquerRetourneHandler = async (command: {
  motDePasse: string
  pretId: number
}): Promise<void> => {
  return bibliothequeRepository.marquerRetourne(command)
}