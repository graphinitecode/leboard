'use client'

import { useQuery } from '@tanstack/react-query'

import { elevesRepository } from '@/students/infrastructure/eleves.repository'
import { nomEleve } from '@/students/domain/eleve.entity'

export const ELEVES_QUERY_KEY = ['eleves']

export const useListElevesDuProf = (profId: number) =>
  useQuery({
    queryKey: [...ELEVES_QUERY_KEY, 'du-prof', profId],
    queryFn: () => elevesRepository.listDuProf(profId),
    enabled: Number.isFinite(profId) && profId > 0,
  })

export const useGetFicheEleve = (eleveId: number) =>
  useQuery({
    queryKey: [...ELEVES_QUERY_KEY, 'fiche', eleveId],
    queryFn: () => elevesRepository.getFiche(eleveId),
    enabled: Number.isFinite(eleveId) && eleveId > 0,
  })

export const useListEnfantsDuParent = (parentId: number) =>
  useQuery({
    queryKey: [...ELEVES_QUERY_KEY, 'enfants', parentId],
    queryFn: () => elevesRepository.listEnfantsDuParent(parentId),
    enabled: Number.isFinite(parentId) && parentId > 0,
  })

export { nomEleve }
