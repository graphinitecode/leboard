'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type ResultatMotDePasse = { ok: true; message: string } | { ok: false; message: string }

// Demande de réinitialisation : Payload génère un token et envoie le lien
// (adapter Resend si configuré, console sinon). Message volontairement identique
// que le compte existe ou non (pas de fuite d'information).
export async function demanderReinitialisation(
  email: string,
): Promise<ResultatMotDePasse> {
  const adresse = email.trim().toLowerCase()
  if (!adresse) return { ok: false, message: 'Saisissez votre adresse e-mail.' }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.forgotPassword({
      collection: 'users',
      data: { email: adresse },
    })
    return {
      ok: true,
      message: 'Si un compte existe pour cette adresse, un e-mail avec le lien de réinitialisation vient de partir.',
    }
  } catch {
    return {
      ok: true,
      message: 'Si un compte existe pour cette adresse, un e-mail vient de partir.',
    }
  }
}

// Réinitialisation effective : token + nouveau mot de passe.
export async function reinitialiserMotDePasse(
  token: string,
  password: string,
): Promise<ResultatMotDePasse> {
  if (!token.trim()) return { ok: false, message: 'Lien invalide : jeton manquant.' }
  if (!password || password.length < 8) {
    return { ok: false, message: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  try {
    const payload = await getPayload({ config: configPromise })
    await payload.resetPassword({
      collection: 'users',
      data: { password, token: token.trim() },
      overrideAccess: true,
    })
    return { ok: true, message: 'Mot de passe modifié. Vous pouvez vous connecter.' }
  } catch {
    return {
      ok: false,
      message: 'Ce lien est invalide ou a expiré. Demandez un nouveau lien.',
    }
  }
}