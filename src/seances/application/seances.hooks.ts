'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getSeanceHandler } from '@/seances/application/queries/get-seance/get-seance.handler'
import { listMySeancesHandler } from '@/seances/application/queries/list-my-seances/list-my-seances.handler'
import { togglePresenceHandler } from '@/seances/application/commands/toggle-presence/toggle-presence.handler'
import { enregistrerRetourHandler } from '@/seances/application/commands/enregistrer-retour/enregistrer-retour.handler'
import type { SeanceDetail } from '@/seances/domain/seance.entity'

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
    // Mise à jour optimiste du détail : le statut choisi reste affiché du
    // clic jusqu'au rechargement (sans elle, le toggle revient un instant sur
    // l'ancien statut entre la fin de l'enregistrement et le refetch).
    onMutate: async (command) => {
      if (!command.seanceId) return { precedent: undefined }
      const queryKey = SEANCE_QUERY_KEY(command.seanceId)
      await queryClient.cancelQueries({ queryKey })
      const precedent = queryClient.getQueryData<SeanceDetail | null>(queryKey)
      if (precedent) {
        queryClient.setQueryData<SeanceDetail>(queryKey, {
          ...precedent,
          presences: precedent.presences.map((presence) =>
            presence.id === command.presenceId ? { ...presence, present: command.statut } : presence,
          ),
        })
      }
      return { precedent }
    },
    onError: (_error, command, contexte) => {
      if (command.seanceId && contexte?.precedent) {
        queryClient.setQueryData(SEANCE_QUERY_KEY(command.seanceId), contexte.precedent)
      }
    },
    onSettled: (_data, _error, command) => {
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