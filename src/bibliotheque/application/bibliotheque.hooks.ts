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
    mutationFn: (command: { motDePasse: string; pretId: number }) =>
      bibliothequeRepository.marquerRetourne(command),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] })
    },
  })
}

export const useEnregistrerPret = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: { eleveId: number; exemplaireId: number; motDePasse: string }) =>
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
    mutationFn: (command: {
      titre: string
      auteur?: string
      niveau?: string
      categorie?: string
      resume?: string
    }) => bibliothequeRepository.creerLivre(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] }),
  })
}

export const useModifierLivre = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: {
      id: number
      titre: string
      auteur?: string
      isbn?: string
      niveau?: string
      categorie?: string
      editeur?: string
      resume?: string
    }) => bibliothequeRepository.modifierLivre(command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bibliotheque', 'catalogue'] }),
  })
}

export const useListPretsParLivre = (livreId: number) =>
  useQuery({
    queryKey: [...PRETS_QUERY_KEY, 'livre', livreId],
    queryFn: () => bibliothequeRepository.listPretsParLivre(livreId),
    enabled: Number.isFinite(livreId) && livreId > 0,
  })