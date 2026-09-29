import configPromise from '@payload-config'
import { AuthenticationError, getPayload, LockedAuth } from 'payload'
import { cookies } from 'next/headers'

import type { User } from '@/payload-types'

const COOKIE_NAME = 'payload-token'

// Session courante dérivée du cookie Payload — jamais du client.
export async function getSessionUser(payload: import('payload').Payload): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
  })
  return user ?? null
}

export type ResultatMotDePasse = 'ok' | 'mot-de-passe-invalide' | 'verrouille'

// Confirmation d'identité : revérifie le mot de passe du compte connecté
// via l'opération login de Payload (PBKDF2 + verrouillage anti-bruteforce
// maxLoginAttempts=5 / lockTime=10 min, défauts Payload). Sans res/cookies :
// le JWT de session n'est jamais émis ni modifié par cette vérification.
// La session courante est passée en req.user (transaction, i18n) mais
// l'opération compare bien le mot de passe fourni, pas la session.
export async function verifierMotDePasse(
  payload: import('payload').Payload,
  user: User,
  motDePasse: string,
): Promise<ResultatMotDePasse> {
  try {
    await payload.login({
      collection: 'users',
      data: { email: user.email, password: motDePasse },
    })
    return 'ok'
  } catch (err) {
    if (err instanceof LockedAuth) return 'verrouille'
    if (err instanceof AuthenticationError) return 'mot-de-passe-invalide'
    throw err
  }
}

export async function getPayloadServer(): Promise<import('payload').Payload> {
  return getPayload({ config: configPromise })
}