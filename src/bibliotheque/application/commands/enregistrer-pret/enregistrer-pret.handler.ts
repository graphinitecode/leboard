import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const enregistrerPretHandler = async (command: {
  eleveId: number
  exemplaireId: number
  motDePasse: string
}): Promise<void> => {
  return bibliothequeRepository.enregistrerPret(command)
}