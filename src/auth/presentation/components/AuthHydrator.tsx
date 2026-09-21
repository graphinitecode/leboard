'use client'

import { useEffect } from 'react'

import { presentUser } from '../user.presenter'
import { useAuthStore } from '../store/auth.store'
import { useGetCurrentUser } from '../../application/auth.hooks'

export function AuthHydrator() {
  const { data: user } = useGetCurrentUser()
  const { login, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (user && !isAuthenticated) {
      login(presentUser(user))
    }
  }, [user, isAuthenticated, login])

  return null
}