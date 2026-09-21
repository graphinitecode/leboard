import type { Seance, SeanceDetail, StatutPresence } from '../seance.entity'

export interface ListMySeancesQuery {
  limite?: number
}

export interface GetSeanceQuery {
  id: number
}

export interface TogglePresenceCommand {
  presenceId: number
  statut: StatutPresence
}

export interface EnregistrerRetourCommand {
  seanceId: number
  retour: string
}

export interface ISeancesRepository {
  listMy(query: ListMySeancesQuery): Promise<Seance[]>
  getDetail(query: GetSeanceQuery): Promise<SeanceDetail | null>
  togglePresence(command: TogglePresenceCommand): Promise<void>
  enregistrerRetour(command: EnregistrerRetourCommand): Promise<void>
}