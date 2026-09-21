'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { planningRepository } from '@/planning/infrastructure/planning.repository'
import type { Disponibilite } from '@/planning/domain/disponibilite.entity'

export const DISPONIBILITES_QUERY_KEY = ['planning', 'disponibilites']

export const useListMesDisponibilites = () =>
  useQuery({
    queryKey: DISPONIBILITES_QUERY_KEY,
    queryFn: () => planningRepository.listMesDisponibilites(),
  })

export const useAjouterDisponibilite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: Disponibilite) => planningRepository.ajouterDisponibilite(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISPONIBILITES_QUERY_KEY }),
  })
}

export const useSupprimerDisponibilite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: Disponibilite) => planningRepository.supprimerDisponibilite(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISPONIBILITES_QUERY_KEY }),
  })
}

export const useModifierDisponibilite = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ origine, nouveau }: { origine: Disponibilite; nouveau: Disponibilite }) =>
      planningRepository.modifierDisponibilite(origine, nouveau),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DISPONIBILITES_QUERY_KEY }),
  })
}