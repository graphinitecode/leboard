'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { progressionsRepository } from '@/progressions/infrastructure/progressions.repository'
import { ajouterProgressionHandler } from '@/progressions/application/commands/ajouter-progression/ajouter-progression.handler'
import { listProgressionsParSeanceHandler } from '@/progressions/application/queries/list-par-seance/list-par-seance.handler'
import type { CompetenceOption, NiveauProgression } from '@/progressions/domain/progression.entity'

export const PROGRESSIONS_QUERY_KEY = (eleveId: number) => ['progressions', eleveId]

export const PROGRESSIONS_SEANCE_QUERY_KEY = (seanceId: number) => ['progressions', 'seance', seanceId]

export const useListProgressionsParSeance = ({ seanceId }: { seanceId: number }) =>
  useQuery({
    queryKey: PROGRESSIONS_SEANCE_QUERY_KEY(seanceId),
    queryFn: () => listProgressionsParSeanceHandler({ seanceId }),
    enabled: Number.isFinite(seanceId) && seanceId > 0,
  })

export const useListProgressionsByEleve = ({
  eleveId,
  limite = 50,
}: { eleveId: number; limite?: number }) =>
  useQuery({
    queryKey: PROGRESSIONS_QUERY_KEY(eleveId),
    queryFn: () => progressionsRepository.listByEleve({ eleveId, limite }),
    enabled: Number.isFinite(eleveId) && eleveId > 0,
  })

export const useListCompetences = () =>
  useQuery({
    queryKey: ['competences'],
    queryFn: () => progressionsRepository.listCompetences(),
  })

export const useAjouterProgression = (seanceId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: {
      eleveId: number
      competenceId: number
      niveau: NiveauProgression
      commentaire?: string
    }) => ajouterProgressionHandler({ ...command, seanceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progressions'] })
    },
  })
}

export type { CompetenceOption, NiveauProgression }