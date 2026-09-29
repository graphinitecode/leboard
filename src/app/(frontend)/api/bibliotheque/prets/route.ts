import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

import { biblioWrite } from '@/access/biblio'
import { verifierMotDePasse } from '@/utilities/sensitive-action'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'payload-token'

export interface ResultatPret {
  status: number
  body: { ok?: true; error?: string }
}

// Engagement patrimonial (un exemplaire part, disponibilité + plafond 3) :
// réservé aux gestionnaires ET conditionné à la revérification du mot de
// passe de la session. La validation métier (dispo, plafond) reste dans les
// hooks Payload (pretsBeforeChange) : ses erreurs remontent en 422.
export async function traiterNouveauPret(
  payload: import('payload').Payload,
  token: string | undefined,
  eleveIdRaw: unknown,
  exemplaireIdRaw: unknown,
  motDePasse: string,
  dateRetourPrevueRaw: unknown = null,
): Promise<ResultatPret> {
  let user = null
  if (token) {
    const auth = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
    })
    user = auth.user ?? null
  }

  if (!user || !biblioWrite({ req: { user } as never })) {
    return {
      status: 403,
      body: { error: 'Réservé aux gestionnaires de la bibliothèque.' },
    }
  }

  if (!motDePasse) {
    return { status: 400, body: { error: 'Mot de passe requis.' } }
  }

  const resultat = await verifierMotDePasse(payload, user, motDePasse)
  if (resultat === 'verrouille') {
    return {
      status: 423,
      body: { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
    }
  }
  if (resultat !== 'ok') {
    return { status: 401, body: { error: 'Mot de passe incorrect.' } }
  }

  const eleveId = Number(eleveIdRaw)
  const exemplaireId = Number(exemplaireIdRaw)
  if (!Number.isInteger(eleveId) || eleveId <= 0 || !Number.isInteger(exemplaireId) || exemplaireId <= 0) {
    return { status: 400, body: { error: 'Élève et exemplaire requis.' } }
  }

  // Date de retour optionnelle : l'assistant la fixe (14 / 21 j ou 1 mois) ;
  // les hooks Payload ne la recalculent que si elle est absente. Repli :
  // DUREE_PRET_JOURS côté serveur.
  let dateRetourPrevue: string | undefined
  if (dateRetourPrevueRaw != null && dateRetourPrevueRaw !== '') {
    if (typeof dateRetourPrevueRaw !== 'string' || Number.isNaN(Date.parse(dateRetourPrevueRaw))) {
      return { status: 400, body: { error: 'Date de retour invalide.' } }
    }
    dateRetourPrevue = dateRetourPrevueRaw
  }

  try {
    await payload.create({
      collection: 'prets',
      data: {
        eleve: eleveId,
        exemplaire: exemplaireId,
        ...(dateRetourPrevue ? { dateRetourPrevue } : {}),
      },
      overrideAccess: false,
      user,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    return {
      status: 422,
      body: {
        error:
          message ||
          'Le prêt a été refusé : exemplaire indisponible ou limite de prêts atteinte.',
      },
    }
  }

  return { status: 200, body: { ok: true } }
}

export async function POST(req: Request) {
  const payload = await getPayload({ config })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  let motDePasse = ''
  let eleveId: unknown = null
  let exemplaireId: unknown = null
  let dateRetourPrevue: unknown = null
  try {
    const body = (await req.json()) as {
      motDePasse?: unknown
      eleveId?: unknown
      exemplaireId?: unknown
      dateRetourPrevue?: unknown
    }
    if (typeof body.motDePasse === 'string') motDePasse = body.motDePasse
    eleveId = body.eleveId
    exemplaireId = body.exemplaireId
    dateRetourPrevue = body.dateRetourPrevue ?? null
  } catch {
    // body manquant : tout vide → 400 via traiterNouveauPret
  }

  const resultat = await traiterNouveauPret(
    payload,
    token,
    eleveId,
    exemplaireId,
    motDePasse,
    dateRetourPrevue,
  )
  return Response.json(resultat.body, { status: resultat.status })
}