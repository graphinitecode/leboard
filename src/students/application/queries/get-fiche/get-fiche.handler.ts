import type { Eleve } from '@/students/domain/eleve.entity'
import { elevesRepository } from '@/students/infrastructure/eleves.repository'

export const getFicheHandler = async (eleveId: number): Promise<Eleve | null> => {
  return elevesRepository.getFiche(eleveId)
}

export const listEnfantsDuParentHandler = async (parentId: number): Promise<Eleve[]> => {
  return elevesRepository.listEnfantsDuParent(parentId)
}
