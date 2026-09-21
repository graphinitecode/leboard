import type { Eleve } from '@/eleves/domain/eleve.entity'
import { elevesRepository } from '@/eleves/infrastructure/eleves.repository'

export const getFicheHandler = async (eleveId: number): Promise<Eleve | null> => {
  return elevesRepository.getFiche(eleveId)
}

export const listEnfantsDuParentHandler = async (parentId: number): Promise<Eleve[]> => {
  return elevesRepository.listEnfantsDuParent(parentId)
}