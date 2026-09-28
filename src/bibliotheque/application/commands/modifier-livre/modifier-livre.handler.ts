import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const modifierLivreHandler = async (command: {
  id: number
  titre: string
  auteur?: string
  isbn?: string
  niveau?: string
  categorie?: string
  editeur?: string
  resume?: string
}): Promise<void> => {
  return bibliothequeRepository.modifierLivre(command)
}