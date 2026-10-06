import type {
  EleveLigne,
  Matiere,
  Seance,
  SeanceDetail,
  StatutPresence,
} from '../domain/seance.entity'
import type {
  GetSeanceQuery,
  ListMySeancesQuery,
  TogglePresenceCommand,
  EnregistrerRetourCommand,
} from '../domain/interfaces/seances-repository.interface'
import type { Eleve, Presence, Seance as SeanceDto, User } from '@/payload-types'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = {
  docs: T[]
  totalDocs: number
}

const mapDtoToSeance = (dto: SeanceDto): Seance => ({
  id: dto.id,
  date: dto.date,
  matiere: dto.matiere as Matiere,
  groupeIds: (dto.groupe ?? []).map((eleve) => (typeof eleve === 'object' ? eleve.id : eleve)),
  profId: typeof dto.prof === 'object' ? dto.prof.id : dto.prof,
  duree: dto.duree ?? null,
  profLabel: labelUtilisateur(typeof dto.prof === 'object' ? dto.prof : null),
  retourTexte: extraireTexte(dto.retour),
  aRetour: Boolean(dto.retour),
  // depth 1 : la série est peuplée
  serie:
    typeof dto.serie === 'object' && dto.serie !== null
      ? { fin: dto.serie.fin ?? null, frequence: dto.serie.frequence, id: dto.serie.id, premiere: dto.serie.premiere }
      : null,
})

const mapDtoToPresence = (dto: Presence): { id: number; seanceId: number; eleveId: number; present: StatutPresence } => ({
  id: dto.id,
  seanceId: typeof dto.seance === 'object' ? dto.seance.id : dto.seance,
  eleveId: typeof dto.eleve === 'object' ? dto.eleve.id : dto.eleve,
  present: dto.present,
})

const mapDtoToEleveLigne = (dto: Eleve): EleveLigne => ({
  id: dto.id,
  prenom: dto.prenom,
  nom: dto.nom,
  groupe: dto.groupe ?? null,
  niveau: dto.niveau ?? null,
})

// Libellé court d'un utilisateur (« Claire D. ») : prénom + initiale du nom.
const labelUtilisateur = (profil: { prenom?: string; nom?: string } | null | undefined): string | null => {
  if (!profil || typeof profil !== 'object' || !profil.prenom) return null
  const initiale = (profil.nom ?? '').charAt(0).toUpperCase()
  return initiale ? `${profil.prenom} ${initiale}.` : profil.prenom
}

function extraireTexte(retour: unknown): string {
  if (!retour || typeof retour !== 'object') return ''
  const root = (retour as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''

  function texte(node: unknown): string {
    if (!node || typeof node !== 'object') return ''
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    return (n.children ?? []).map(texte).join('')
  }

  return root.children.map(texte).filter(Boolean).join('\n')
}

function texteVersLexical(texte: string) {
  return {
    root: {
      children: [
        {
          children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: texte, type: 'text' }],
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export const seancesRepository = {
  async listMy({ limite = 30 }: ListMySeancesQuery): Promise<Seance[]> {
    try {
      // GET /api/users/me renvoie { user, ... } : sans le wrapper, id est undefined.
      const me = await httpClient.get<{ user: Pick<User, 'id'> }>('/users/me')
      const res = await httpClient.get<Paginated<SeanceDto>>('/seances', {
        params: {
          depth: 1,
          limit: limite,
          sort: '-date',
          where: JSON.stringify({ prof: { equals: me.data.user.id } }),
        },
      })
      return res.data.docs.map(mapDtoToSeance)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les séances.'))
    }
  },

  async getDetail({ id }: GetSeanceQuery): Promise<SeanceDetail | null> {
    try {
      const res = await httpClient.get<SeanceDto>(`/seances/${id}`, { params: { depth: 1 } })
      const seance = mapDtoToSeance(res.data)

      const presencesRes = await httpClient.get<Paginated<Presence>>('/presences', {
        params: {
          depth: 1,
          limit: 0,
          sort: 'createdAt',
          where: JSON.stringify({ seance: { equals: id } }),
        },
      })

      const elevesDuGroupe: EleveLigne[] = []
      if (seance.groupeIds.length > 0) {
        const elevesRes = await httpClient.get<Paginated<Eleve>>('/eleves', {
          params: {
            depth: 0,
            limit: 0,
            sort: 'nom',
            where: JSON.stringify({ id: { in: seance.groupeIds } }),
          },
        })
        elevesRes.data.docs.forEach((eleve) => elevesDuGroupe.push(mapDtoToEleveLigne(eleve)))
      }

      return {
        seance,
        presences: presencesRes.data.docs.map(mapDtoToPresence),
        elevesDuGroupe,
      }
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status
      if (status === 404) return null
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger la séance.'))
    }
  },

  async togglePresence({ presenceId, statut }: TogglePresenceCommand): Promise<void> {
    try {
      await httpClient.patch(`/presences/${presenceId}`, { present: statut })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Échec de l'enregistrement."))
    }
  },

  async enregistrerRetour({ seanceId, retour }: EnregistrerRetourCommand): Promise<void> {
    try {
      await httpClient.patch(`/seances/${seanceId}`, { retour: texteVersLexical(retour) })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Échec de l'enregistrement."))
    }
  },

  async listPresencesParEleve(eleveId: number): Promise<
    { id: number; seanceId: number; eleveId: number; present: StatutPresence }[]
  > {
    try {
      const res = await httpClient.get<Paginated<Presence>>('/presences', {
        params: {
          depth: 1,
          limit: 0,
          sort: '-createdAt',
          where: JSON.stringify({ eleve: { equals: eleveId } }),
        },
      })
      return res.data.docs.map(mapDtoToPresence)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les présences.'))
    }
  },
}