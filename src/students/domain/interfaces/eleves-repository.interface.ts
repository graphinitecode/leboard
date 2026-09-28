import type { Eleve } from '../eleve.entity'

export interface IElevesRepository {
  listDuProf(profId: number): Promise<Eleve[]>
}