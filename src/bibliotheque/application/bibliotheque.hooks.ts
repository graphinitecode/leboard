'use client'

import { useQuery } from '@tanstack/react-query'

import { bibliothequeRepository } from '@/bibliotheque/infrastructure/bibliotheque.repository'

export const PRETS_QUERY_KEY = ['bibliotheque', 'prets']

export const useListPretsEnCours = ({ eleveId }: { eleveId?: number } = {}) =>
  useQuery({
    queryKey: [...PRETS_QUERY_KEY, eleveId ?? null],
    queryFn: () => bibliothequeRepository.listPretsEnCours({ eleveId }),
  })