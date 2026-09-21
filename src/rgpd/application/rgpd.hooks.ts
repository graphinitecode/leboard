'use client'

import { useQuery } from '@tanstack/react-query'

import { rgpdRepository } from '@/rgpd/infrastructure/rgpd.repository'

export const POLITIQUE_QUERY_KEY = ['rgpd', 'politique']

export const useGetPolitique = () =>
  useQuery({
    queryKey: POLITIQUE_QUERY_KEY,
    queryFn: () => rgpdRepository.getPolitique(),
    staleTime: 10 * 60 * 1000,
  })