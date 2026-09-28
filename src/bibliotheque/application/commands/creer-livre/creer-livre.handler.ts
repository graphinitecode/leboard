import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const creerLivreHandler = async (command: {
  titre: string
  auteur?: string
  niveau?: string
  categorie?: string
}): Promise<number> => {
  return bibliothequeRepository.creerLivre(command)
}