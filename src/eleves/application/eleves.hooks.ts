'use client'

import { useQuery } from '@tanstack/react-query'

import { elevesRepository } from '@/eleves/infrastructure/eleves.repository'
import { nomEleve } from '@/eleves/domain/eleve.entity'

export const ELEVES_QUERY_KEY = ['eleves']

export const useListElevesDuProf = (profId: number) =>
  useQuery({
    queryKey: [...ELEVES_QUERY_KEY, 'du-prof', profId],
    queryFn: () => elevesRepository.listDuProf(profId),
    enabled: Number.isFinite(profId) && profId > 0,
  })

export { nomEleve }