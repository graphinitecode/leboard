import type { Eleve } from '@/eleves/domain/eleve.entity'
import { elevesRepository } from '@/eleves/infrastructure/eleves.repository'

export const listElevesDuProfHandler = async (profId: number): Promise<Eleve[]> => {
  return elevesRepository.listDuProf(profId)
}