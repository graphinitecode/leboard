import type { CollectionAfterChangeHook } from 'payload'

const URL_BASE =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// Invitation parent : à la création d'un compte rôle « parent », on génère un
// token de réinitialisation (forgotPassword) et on envoie un e-mail invitant
// à choisir le mot de passe via la page publique. No-op si l'adapter email
// n'est pas configuré (pas de RESEND_API_KEY) — un log le rappelle.
export const inviterNouveauParent: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc
  if (doc.role !== 'parent') return doc

  try {
    await req.payload.forgotPassword({
      collection: 'users',
      data: { email: doc.email },
    })

    req.payload.logger.info({
      msg: `Email d'invitation envoyé au parent ${doc.email}`,
    })
  } catch (err) {
    req.payload.logger.warn({
      err,
      msg: `Impossible d'envoyer l'invitation au parent ${doc.email} — adapter email absent ou en erreur (mot de passe à transmettre par l'association)`,
    })
  }

  return doc
}

// Exposé pour l'URL publique utilisée dans les emails.
export const URL_REINITIALISATION = `${URL_BASE}/reinitialiser-mot-de-passe`