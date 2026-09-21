'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { getCurrentUserHandler } from '@/auth/application/queries/get-current-user/get-current-user.handler'
import { loginParentHandler } from '@/auth/application/commands/login-parent/login-parent.handler'
import { loginProfHandler } from '@/auth/application/commands/login-prof/login-prof.handler'
import { logoutHandler } from '@/auth/application/commands/logout/logout.handler'
import { presentUser } from '@/auth/presentation/user.presenter'
import { useAuthStore } from '@/auth/presentation/store/auth.store'

export const CURRENT_USER_QUERY_KEY = ['auth', 'currentUser']

export const useLoginProf = (cible: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { login: storeLogin } = useAuthStore()

  return useMutation({
    mutationFn: (command: { email: string; password: string }) => loginProfHandler(command),
    onSuccess: (user) => {
      storeLogin(presentUser(user))
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      router.push(cible)
    },
  })
}

export const useLoginParent = (cible: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { login: storeLogin } = useAuthStore()

  return useMutation({
    mutationFn: (command: { email: string; password: string }) => loginParentHandler(command),
    onSuccess: (user) => {
      storeLogin(presentUser(user))
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, user)
      router.push(cible)
    },
  })
}

export const useLogout = (cible: string) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { logout: storeLogout } = useAuthStore()

  return useMutation({
    mutationFn: () => logoutHandler(),
    onSuccess: () => {
      storeLogout()
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null)
      router.push(cible)
    },
  })
}

export const useGetCurrentUser = () =>
  useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUserHandler(),
    staleTime: 5 * 60 * 1000,
  })

export const prefetchCurrentUser = (queryClient: {
  fetchQuery: (opts: { queryKey: unknown[]; queryFn: () => Promise<unknown> }) => Promise<unknown>
}) =>
  queryClient.fetchQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => getCurrentUserHandler(),
  })