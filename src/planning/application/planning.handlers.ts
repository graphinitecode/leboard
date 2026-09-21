import type { Disponibilite } from '@/planning/domain/disponibilite.entity'
import { planningRepository } from '@/planning/infrastructure/planning.repository'

export const listMesDisponibilitesHandler = async (): Promise<Disponibilite[]> => {
  return planningRepository.listMesDisponibilites()
}

export const ajouterDisponibiliteHandler = async (command: Disponibilite): Promise<void> => {
  return planningRepository.ajouterDisponibilite(command)
}

export const supprimerDisponibiliteHandler = async (command: Disponibilite): Promise<void> => {
  return planningRepository.supprimerDisponibilite(command)
}

export const modifierDisponibiliteHandler = async (
  origine: Disponibilite,
  nouveau: Disponibilite,
): Promise<void> => {
  return planningRepository.modifierDisponibilite(origine, nouveau)
}