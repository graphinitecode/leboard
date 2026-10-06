'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { calendrierHandlers } from './calendrier.handlers'
import type { CreerSeanceCommand, SeancesPeriodeQuery } from '../domain/interfaces/calendrier-repository.interface'
import type {
  CreerSerieCommand,
  DeplacerSeanceCommand,
  SupprimerSeanceCommand,
} from '../domain/interfaces/calendrier-repository.interface'

export const CALENDRIER_QUERY_KEY = (debut: string) => ['calendrier', 'seances', debut]

export const useSeancesPeriode = (query: SeancesPeriodeQuery) =>
  useQuery({
    queryKey: CALENDRIER_QUERY_KEY(query.debut.toISOString()),
    queryFn: () => calendrierHandlers.listMySeancesPeriode(query),
  })

export const useElevesDuProf = () =>
  useQuery({
    queryKey: ['calendrier', 'eleves'],
    queryFn: () => calendrierHandlers.listElevesDuProf(),
  })

export const useCreerSeance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: CreerSeanceCommand) => calendrierHandlers.creerSeance(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendrier'] }),
  })
}

export const useDeplacerSeance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: DeplacerSeanceCommand) => calendrierHandlers.deplacerSeance(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendrier'] }),
  })
}
export const useCreerSerie = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: CreerSerieCommand) => calendrierHandlers.creerSerie(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendrier'] }),
  })
}

export const useSupprimerSeance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: SupprimerSeanceCommand) => calendrierHandlers.supprimerSeance(command),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
