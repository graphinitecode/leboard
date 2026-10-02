'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getSeanceHandler } from '@/seances/application/queries/get-seance/get-seance.handler'
import { listMySeancesHandler } from '@/seances/application/queries/list-my-seances/list-my-seances.handler'
import { togglePresenceHandler } from '@/seances/application/commands/toggle-presence/toggle-presence.handler'
import { enregistrerRetourHandler } from '@/seances/application/commands/enregistrer-retour/enregistrer-retour.handler'

export const SEANCES_QUERY_KEY = ['seances']
export const SEANCE_QUERY_KEY = (id: number) => ['seances', id]

export const useListMySeances = ({ limite = 30 } = {}) =>
  useQuery({
    queryKey: [...SEANCES_QUERY_KEY, limite],
    queryFn: () => listMySeancesHandler({ limite }),
  })

export const useGetSeance = (id: number) =>
  useQuery({
    queryKey: SEANCE_QUERY_KEY(id),
    queryFn: () => getSeanceHandler({ id }),
    enabled: Number.isFinite(id),
  })

export const useTogglePresence = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (command: {
      presenceId: number
      seanceId?: number
      statut: 'present' | 'absent' | 'absent-justifie'
    }) => togglePresenceHandler(command),
    onSuccess: (_data, command) => {
      // seanceId : fourni par la vue séance cibler la bonne requête détail
      // (la présence ≠ l'id de la séance).
      if (command.seanceId) {
        queryClient.invalidateQueries({ queryKey: SEANCE_QUERY_KEY(command.seanceId) })
      }
      queryClient.invalidateQueries({ queryKey: SEANCES_QUERY_KEY })
    },
  })
}

export const useEnregistrerRetour = (seanceId: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (retour: string) => enregistrerRetourHandler({ seanceId, retour }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SEANCE_QUERY_KEY(seanceId) })
      queryClient.invalidateQueries({ queryKey: SEANCES_QUERY_KEY })
    },
  })
}