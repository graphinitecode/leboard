'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'payload-token'

// Pages de connexion des portails : seules destinations acceptées après
// déconnexion (le champ vient du formulaire, donc du client)
const LOGIN_PAGES = ['/profs/login', '/parents/login']

// Déconnexion : supprime le cookie de session Payload puis renvoie vers la
// page de connexion du portail quitté (accueil du site à défaut).
export async function logout(formData?: FormData) {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)

  const redirectTo = formData?.get('redirectTo')
  redirect(typeof redirectTo === 'string' && LOGIN_PAGES.includes(redirectTo) ? redirectTo : '/')
}
