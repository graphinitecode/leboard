'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'payload-token'

// Déconnexion : supprime le cookie de session Payload puis redirige.
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/')
}