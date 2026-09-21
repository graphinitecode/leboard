import type { Competence, Progression as ProgressionDto } from '@/payload-types'
import type {
  AjouterProgressionCommand,
  ListByEleveQuery,
} from '@/progressions/domain/interfaces/progressions-repository.interface'
import type {
  CompetenceOption,
  Progression,
} from '@/progressions/domain/progression.entity'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

type Paginated<T> = { docs: T[]; totalDocs: number }

const mapDtoToProgression = (dto: ProgressionDto): Progression => ({
  id: dto.id,
  eleveId: typeof dto.eleve === 'object' ? dto.eleve.id : dto.eleve,
  competenceId: typeof dto.competence === 'object' ? dto.competence.id : dto.competence,
  competenceLabel:
    typeof dto.competence === 'object' ? (dto.competence?.label ?? null) : null,
  niveau: dto.niveau,
  date: dto.date,
  commentaire: dto.commentaire ?? null,
})

const mapDtoToCompetenceOption = (dto: Competence): CompetenceOption => ({
  id: dto.id,
  label: dto.label,
  matiere: dto.matiere,
})

export const progressionsRepository = {
  async listByEleve({ eleveId, limite = 50 }: ListByEleveQuery): Promise<Progression[]> {
    try {
      const res = await httpClient.get<Paginated<ProgressionDto>>('/progressions', {
        params: {
          depth: 1,
          limit: limite,
          sort: '-date',
          where: JSON.stringify({ eleve: { equals: eleveId } }),
        },
      })
      return res.data.docs.map(mapDtoToProgression)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les progressions.'))
    }
  },

  async ajouter({
    eleveId,
    competenceId,
    niveau,
    seanceId,
    commentaire,
  }: AjouterProgressionCommand): Promise<void> {
    try {
      await httpClient.post('/progressions', {
        eleve: eleveId,
        competence: competenceId,
        niveau,
        date: new Date().toISOString(),
        ...(seanceId ? { seance: seanceId } : {}),
        ...(commentaire ? { commentaire } : {}),
      })
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, "Échec de l'enregistrement."))
    }
  },

  async listCompetences(): Promise<CompetenceOption[]> {
    try {
      const res = await httpClient.get<Paginated<Competence>>('/competences', {
        params: { depth: 0, limit: 0, sort: 'label' },
      })
      return res.data.docs.map(mapDtoToCompetenceOption)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger les compétences.'))
    }
  },
}