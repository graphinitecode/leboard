import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

import { biblioWrite } from '@/access/biblio'
import { verifierMotDePasse } from '@/utilities/sensitive-action'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'payload-token'

export interface ResultatRetour {
  status: number
  body: { ok?: true; error?: string }
}

// Clôture d'un prêt (action patrimoniale) : réservée aux gestionnaires de
// bibliothèque ET conditionnée à la revérification du mot de passe de la
// session (quelqu'un devant l'écran ne peut pas valider à la place du
// compte connecté). L'écriture passe par la local API avec la session
// (overrideAccess: false) : le contrôle d'accès biblioWrite s'applique.
export async function traiterRetour(
  payload: import('payload').Payload,
  token: string | undefined,
  pretIdRaw: string | number,
  motDePasse: string,
): Promise<ResultatRetour> {
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

  const pretId = Number(pretIdRaw)
  if (!Number.isInteger(pretId) || pretId <= 0) {
    return { status: 404, body: { error: 'Prêt introuvable.' } }
  }

  try {
    await payload.findByID({
      collection: 'prets',
      id: pretId,
      depth: 0,
      overrideAccess: true,
    })
  } catch {
    return { status: 404, body: { error: 'Prêt introuvable.' } }
  }

  await payload.update({
    collection: 'prets',
    id: pretId,
    data: { dateRetourEffective: new Date().toISOString() },
    overrideAccess: false,
    user,
  })

  return { status: 200, body: { ok: true } }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const payload = await getPayload({ config })

  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  let motDePasse = ''
  try {
    const body = (await req.json()) as { motDePasse?: unknown }
    if (typeof body.motDePasse === 'string') motDePasse = body.motDePasse
  } catch {
    // body manquant : motDePasse vide → 400 via traiterRetour
  }

  const resultat = await traiterRetour(payload, token, id, motDePasse)
  return Response.json(resultat.body, { status: resultat.status })
}