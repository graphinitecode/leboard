import type { Endpoint, PayloadRequest } from 'payload'

import type { PorteeSerie } from '../domain/recurrence'

import { ErreurSerie, modifierSeanceSerie, PORTEES, supprimerSeanceSerie } from './series.server'

async function lireCorps(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    return ((await req.json?.()) ?? {}) as Record<string, unknown>
  } catch {
    return {}
  }
}

// Séance de l'utilisateur connecté (les règles d'accès de la collection
// s'appliquent : un prof n'atteint que ses propres séances)
async function seanceAutorisee(req: PayloadRequest) {
  if (!req.user) throw new Response(JSON.stringify({ error: 'Connexion requise.' }), { status: 401 })
  const id = Number(req.routeParams?.id)
  try {
    return await req.payload.findByID({ collection: 'seances', depth: 0, id, overrideAccess: false, user: req.user })
  } catch {
    throw new Response(JSON.stringify({ error: 'Séance introuvable.' }), { status: 404 })
  }
}

function portee(valeur: unknown): PorteeSerie {
  if (!PORTEES.includes(valeur as PorteeSerie)) {
    throw new Response(JSON.stringify({ error: 'Portée inconnue.' }), { status: 400 })
  }
  return valeur as PorteeSerie
}

async function repondre(action: () => Promise<number>): Promise<Response> {
  try {
    return Response.json({ modifiees: await action() })
  } catch (err) {
    if (err instanceof Response) return err
    if (err instanceof ErreurSerie) return Response.json({ error: err.message }, { status: 400 })
    throw err
  }
}

// POST /api/seances/:id/serie { portee, date, duree } : déplace ou change la
// durée de cette séance, de celle-ci et des suivantes, ou de toute la série
export const modifierSerieEndpoint: Endpoint = {
  handler: (req) =>
    repondre(async () => {
      const seance = await seanceAutorisee(req)
      const corps = await lireCorps(req)
      const date = new Date(String(corps.date ?? seance.date))
      const duree = Number(corps.duree ?? seance.duree ?? 60)
      if (Number.isNaN(date.getTime()) || !Number.isFinite(duree) || duree < 30) {
        throw new Response(JSON.stringify({ error: 'Date ou durée invalide.' }), { status: 400 })
      }
      return modifierSeanceSerie({ date, duree, payload: req.payload, portee: portee(corps.portee), seance })
    }),
  method: 'post',
  path: '/:id/serie',
}

// POST /api/seances/:id/supprimer { portee } : supprime cette séance, celle-ci
// et les suivantes, ou toute la série (séances passées conservées). Hors
// série, la suppression reste réservée à l'admin (règle de la collection).
export const supprimerSerieEndpoint: Endpoint = {
  handler: (req) =>
    repondre(async () => {
      const seance = await seanceAutorisee(req)
      const corps = await lireCorps(req)
      if (!seance.serie && req.user?.role !== 'admin') {
        throw new Response(JSON.stringify({ error: 'Suppression réservée à l’administration.' }), { status: 403 })
      }
      return supprimerSeanceSerie({ payload: req.payload, portee: portee(corps.portee), seance })
    }),
  method: 'post',
  path: '/:id/supprimer',
}
