import type { Eleve } from '@/students/domain/eleve.entity'
import { elevesRepository } from '@/students/infrastructure/eleves.repository'

export const listElevesDuProfHandler = async (profId: number): Promise<Eleve[]> => {
  return elevesRepository.listDuProf(profId)
}
