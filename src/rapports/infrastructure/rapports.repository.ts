import type { Presence as PresenceDto, Seance as SeanceDto } from '@/payload-types'
import type { StatsPresencesEleve } from '@/rapports/domain/rapport.entity'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = { docs: T[]; totalDocs: number }

export const rapportsRepository = {
  async calculerPresencesEleve(
    eleveId: number,
    periodeDebut: Date,
    periodeFin: Date,
  ): Promise<StatsPresencesEleve> {
    try {
      const seancesRes = await httpClient.get<Paginated<SeanceDto>>('/seances', {
        params: {
          depth: 0,
          limit: 0,
          sort: '-date',
          where: JSON.stringify({
            and: [
              { groupe: { equals: eleveId } },
              { date: { greater_than_equal: periodeDebut.toISOString() } },
              { date: { less_than_equal: periodeFin.toISOString() } },
            ],
          }),
        },
      })

      const presencesRes = await httpClient.get<Paginated<PresenceDto>>('/presences', {
        params: {
          depth: 0,
          limit: 0,
          where: JSON.stringify({ eleve: { equals: eleveId } }),
        },
      })

      const parSeance = new Map(
        presencesRes.data.docs.map((presence) => [
          typeof presence.seance === 'object' ? presence.seance.id : presence.seance,
          presence.present,
        ]),
      )

      let presentes = 0
      let absences = 0
      let absencesJustifiees = 0

      for (const seance of seancesRes.data.docs) {
        const statut = parSeance.get(seance.id)
        if (statut === 'present') presentes++
        else if (statut === 'absent-justifie') {
          absences++
          absencesJustifiees++
        } else if (statut === 'absent') absences++
      }

      const attendues = seancesRes.data.docs.length

      return {
        absences,
        absencesJustifiees,
        attendues,
        presentes,
        taux: attendues > 0 ? Math.round((presentes / attendues) * 100) : null,
      }
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de calculer le rapport.'))
    }
  },
}