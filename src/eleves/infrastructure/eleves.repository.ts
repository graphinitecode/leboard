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

  async getFiche(eleveId: number): Promise<import('@/eleves/domain/eleve.entity').Eleve | null> {
    try {
      const res = await httpClient.get<EleveDto>(`/eleves/${eleveId}`, { params: { depth: 0 } })
      return mapDtoToEleve(res.data)
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 404) return null
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger la fiche élève.'))
    }
  },

  async listEnfantsDuParent(parentId: number): Promise<Eleve[]> {
    try {
      const res = await httpClient.get<Paginated<EleveDto>>('/eleves', {
        params: {
          depth: 0,
          limit: 0,
          where: JSON.stringify({ parents: { equals: parentId } }),
        },
      })
      return res.data.docs.map(mapDtoToEleve)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les enfants.'))
    }
  },
}