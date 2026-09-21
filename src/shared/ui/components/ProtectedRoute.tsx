'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/auth/presentation/store/auth.store'

export function ProtectedRoute({
  children,
  redirect = '/profs/login',
}: {
  children: React.ReactNode
  redirect?: string
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, redirect, router])

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}