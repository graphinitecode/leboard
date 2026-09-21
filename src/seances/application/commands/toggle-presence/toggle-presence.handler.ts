import type { TogglePresenceCommand } from '@/seances/domain/interfaces/seances-repository.interface'
import { seancesRepository } from '@/seances/infrastructure/seances.repository'

export const togglePresenceHandler = async (command: TogglePresenceCommand): Promise<void> => {
  return seancesRepository.togglePresence(command)
}