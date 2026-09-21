import type { Pret } from '../pret.entity'

export interface ListPretsEnCoursQuery {
  eleveId?: number
}

export interface IBibliothequeRepository {
  listPretsEnCours(query: ListPretsEnCoursQuery): Promise<Pret[]>
}