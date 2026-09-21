import type { Eleve as EleveDto } from '@/payload-types'
import type { Eleve } from '@/eleves/domain/eleve.entity'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = { docs: T[]; totalDocs: number }

const mapDtoToEleve = (dto: EleveDto): Eleve => ({
  id: dto.id,
  prenom: dto.prenom,
  nom: dto.nom,
  niveau: dto.niveau,
  groupe: dto.groupe ?? null,
})

export const elevesRepository = {
  async listDuProf(profId: number): Promise<Eleve[]> {
    try {
      const res = await httpClient.get<Paginated<EleveDto>>('/eleves', {
        params: {
          depth: 0,
          limit: 0,
          sort: 'nom',
          where: JSON.stringify({ profReferent: { equals: profId } }),
        },
      })
      return res.data.docs.map(mapDtoToEleve)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les élèves.'))
    }
  },
}