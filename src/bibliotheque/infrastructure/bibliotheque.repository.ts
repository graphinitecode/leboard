import type { Pret as PretDto } from '@/payload-types'
import type { ListPretsEnCoursQuery } from '@/bibliotheque/domain/interfaces/bibliotheque-repository.interface'
import type { Pret } from '@/bibliotheque/domain/pret.entity'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = { docs: T[]; totalDocs: number }

const mapDtoToPret = (dto: PretDto): Pret => ({
  id: dto.id,
  eleveId: typeof dto.eleve === 'object' ? dto.eleve.id : dto.eleve,
  livreLabel:
    typeof dto.exemplaire === 'object' && dto.exemplaire
      ? typeof dto.exemplaire.livre === 'object' && dto.exemplaire.livre
        ? dto.exemplaire.livre.titre
        : null
      : null,
  dateRetourPrevue: dto.dateRetourPrevue ?? null,
  dateRetourEffective: dto.dateRetourEffective ?? null,
})

export const bibliothequeRepository = {
  async listPretsEnCours({ eleveId }: ListPretsEnCoursQuery): Promise<Pret[]> {
    try {
      const where = eleveId
        ? { and: [{ eleve: { equals: eleveId } }, { dateRetourEffective: { equals: null } }] }
        : { dateRetourEffective: { equals: null } }

      const res = await httpClient.get<Paginated<PretDto>>('/prets', {
        params: {
          depth: 2,
          limit: 10,
          where: JSON.stringify(where),
        },
      })
      return res.data.docs.map(mapDtoToPret)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les prêts.'))
    }
  },
}