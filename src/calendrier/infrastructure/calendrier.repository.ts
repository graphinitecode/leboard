import type {
  CreerSeanceCommand,
  DeplacerSeanceCommand,
  ICalendrierRepository,
  SeancesPeriodeQuery,
} from '../domain/interfaces/calendrier-repository.interface'
import type { EventCalendrier, MatiereCalendrier } from '../domain/calendrier.entity'
import { matiereFiable } from '../domain/calendrier.utils'
import type { Eleve, Seance as SeanceDto, User } from '@/payload-types'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = {
  docs: T[]
  totalDocs: number
}

type MeResponse = { user: Pick<User, 'id'> }

const isoSemaine = (date: Date): string => date.toISOString()

const mapDtoToEvent = (dto: SeanceDto): EventCalendrier => {
  const premierGroupe = dto.groupe?.[0]
  const labelGroupe =
    typeof premierGroupe === 'object' && premierGroupe !== null
      ? `${premierGroupe.prenom} ${premierGroupe.nom.charAt(0)}.`
      : ''
  const duree = typeof dto.duree === 'number' && dto.duree > 0 ? dto.duree : 60
  return {
    id: dto.id,
    debut: new Date(dto.date),
    dureeMin: duree,
    matiere: matiereFiable(String(dto.matiere)),
    labelGroupe,
    href: `/profs/seances/${dto.id}`,
  }
}

export const calendrierRepository: ICalendrierRepository = {
  async listMySeancesPeriode({ debut, fin }: SeancesPeriodeQuery): Promise<EventCalendrier[]> {
    try {
      const me = await httpClient.get<MeResponse>('/users/me')
      const where = JSON.stringify({
        and: [
          { prof: { equals: me.data.user.id } },
          { date: { greater_than_equal: isoSemaine(debut) } },
          { date: { less_than_equal: isoSemaine(fin) } },
        ],
      })
      const res = await httpClient.get<Paginated<SeanceDto>>('/seances', {
        params: { depth: 1, limit: 100, sort: 'date', where },
      })
      return res.data.docs.map(mapDtoToEvent)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les séances de la semaine.'))
    }
  },

  async listElevesDuProf(): Promise<{ id: number; prenom: string; nom: string; niveau: string }[]> {
    try {
      const me = await httpClient.get<MeResponse>('/users/me')
      const where = JSON.stringify({ profReferent: { equals: me.data.user.id } })
      const res = await httpClient.get<Paginated<Eleve>>('/eleves', {
        params: { depth: 0, limit: 0, sort: 'nom', where },
      })
      return res.data.docs.map((e) => ({ id: e.id, prenom: e.prenom, nom: e.nom, niveau: e.niveau }))
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les élèves.'))
    }
  },

  async creerSeance(command: CreerSeanceCommand): Promise<EventCalendrier | null> {
    try {
      const res = await httpClient.post<SeanceDto>('/seances', {
        date: command.debut.toISOString(),
        duree: command.dureeMin,
        matiere: command.matiere,
        groupe: command.eleveIds,
        prof: await monId(),
      })
      return mapDtoToEvent(res.data)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de créer la séance.'))
    }
  },

  async deplacerSeance({ seanceId, nouvelleDate, dureeMin }: DeplacerSeanceCommand): Promise<void> {
    try {
      await httpClient.patch(`/seances/${seanceId}`, {
        date: nouvelleDate.toISOString(),
        duree: dureeMin,
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de déplacer la séance.'))
    }
  },
}

async function monId(): Promise<number> {
  const me = await httpClient.get<MeResponse>('/users/me')
  return me.data.user.id
}

export type { EventCalendrier, MatiereCalendrier }