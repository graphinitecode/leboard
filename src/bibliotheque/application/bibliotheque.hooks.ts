'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const PRETS_QUERY_KEY = ['bibliotheque', 'prets']
export const CATALOGUE_QUERY_KEY = ['bibliotheque', 'catalogue']

export const useListPretsEnCours = ({ eleveId }: { eleveId?: number } = {}) =>
  useQuery({
    queryKey: [...PRETS_QUERY_KEY, eleveId ?? null],
    queryFn: () => bibliothequeRepository.listPretsEnCours({ eleveId }),
  })

export const useListTousPretsEnCours = () =>
  useQuery({
    queryKey: PRETS_QUERY_KEY,
    queryFn: () => bibliothequeRepository.listTousPretsEnCours(),
  })

export const useListCatalogue = () =>
  useQuery({
    queryKey: CATALOGUE_QUERY_KEY_COMPOSED(),
    queryFn: () => bibliothequeRepository.listCatalogue(),
  })

const CATALOGUE_QUERY_KEY_COMPOSED = () => ['bibliotheque', 'catalogue'] as const

export const useMarquerRetourne = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pretId: number) => bibliothequeRepository.marquerRetourne(pretId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] })
    },
  })
}

export const useEnregistrerPret = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: { eleveId: number; exemplaireId: number }) =>
      bibliothequeRepository.enregistrerPret(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] })
    },
  })
}

export const useCreerLivre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: { titre: string; auteur?: string; niveau?: string; categorie?: string }) =>
      bibliothequeRepository.creerLivre(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] }),
  })
}