import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const enregistrerPretHandler = async (command: {
  eleveId: number
  exemplaireId: number
}): Promise<void> => {
  return bibliothequeRepository.enregistrerPret(command)
}