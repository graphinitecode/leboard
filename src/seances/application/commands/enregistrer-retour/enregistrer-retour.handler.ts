import type { EnregistrerRetourCommand } from '@/seances/domain/interfaces/seances-repository.interface'
import { seancesRepository } from '@/seances/infrastructure/seances.repository'

export const enregistrerRetourHandler = async (command: EnregistrerRetourCommand): Promise<void> => {
  return seancesRepository.enregistrerRetour(command)
}