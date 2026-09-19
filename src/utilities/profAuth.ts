import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import type { User } from '@/payload-types'

const COOKIE_NAME = 'payload-token'

export async function getMeUserServer(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
  })
  return user ?? null
}

export async function requireProf(): Promise<User> {
  const user = await getMeUserServer()
  if (!user || (user.role !== 'prof' && user.role !== 'admin')) {
    redirect('/profs/login')
  }
  return user as User
}