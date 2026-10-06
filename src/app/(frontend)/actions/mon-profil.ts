'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'

import type { User } from '@/payload-types'

const COOKIE_NAME = 'payload-token'

export interface ProfilInput {
  prenom: string
  nom: string
  telephone?: string
  /** Parents : recevoir les alertes par e-mail (retards, rappels, absences). */
  alertesEmail?: boolean
}

export type ResultatProfil =
  | { ok: true }
  | { ok: false; erreurs: { champ: 'prenom' | 'nom' | 'telephone' | 'global'; message: string }[] }

// Mise à jour du profil par l'utilisateur lui-même (profs et parents).
// Le user est identifié par le cookie de session Payload : on ne fait
// confiance qu'à user.id issu de la vérification JWT (jamais au client).
export async function updateMonProfil(input: ProfilInput): Promise<ResultatProfil> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) {
    return { ok: false, erreurs: [{ champ: 'global', message: 'Session expirée. Reconnectez-vous.' }] }
  }

  const prenom = input.prenom.trim()
  const nom = input.nom.trim()

  const erreurs: { champ: 'prenom' | 'nom' | 'telephone' | 'global'; message: string }[] = []
  if (!prenom) erreurs.push({ champ: 'prenom', message: 'Saisissez votre prénom.' })
  if (!nom) erreurs.push({ champ: 'nom', message: 'Saisissez votre nom.' })

  if (erreurs.length > 0) return { ok: false, erreurs }

  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
    })

    if (!user) {
      return { ok: false, erreurs: [{ champ: 'global', message: 'Session expirée. Reconnectez-vous.' }] }
    }

    const data: Partial<User> = {
      prenom,
      nom,
      telephone: input.telephone?.trim() || undefined,
      // Préférence propre aux parents : ignorée pour les autres rôles
      ...(user.role === 'parent' && typeof input.alertesEmail === 'boolean'
        ? { alertesEmail: input.alertesEmail }
        : {}),
    }

    await payload.update({
      collection: 'users',
      id: user.id,
      data,
      overrideAccess: false,
    })

    return { ok: true }
  } catch {
    return {
      ok: false,
      erreurs: [{ champ: 'global', message: "Impossible d'enregistrer vos modifications. Réessayez." }],
    }
  }
}