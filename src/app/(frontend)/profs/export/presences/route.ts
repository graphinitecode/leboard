import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'

import { nomFichierCsv, versCsv } from '@/shared/csv'
import { lignesExportPresences, lireParametresExport } from '@/utilities/exportPresences'
import { getMeUserServer } from '@/utilities/profAuth'

export const dynamic = 'force-dynamic'

// GET /profs/export/presences?debut=AAAA-MM-JJ&fin=AAAA-MM-JJ&eleve=ID
// Fichier CSV des présences. Les règles d'accès de la collection
// s'appliquent : l'admin exporte tout, un prof les présences de ses séances.
export async function GET(req: Request): Promise<Response> {
  const user = await getMeUserServer()
  if (!user || (user.role !== 'admin' && user.role !== 'prof')) {
    return new Response('Accès réservé aux profs et à l’administration.', { status: 403 })
  }

  const parametres = lireParametresExport(new URL(req.url).searchParams)
  if (!parametres.ok) {
    return new Response(parametres.message, { status: 400 })
  }

  const conditions: Where[] = []
  if (parametres.eleveId) conditions.push({ eleve: { equals: parametres.eleveId } })
  if (parametres.depuis) conditions.push({ 'seance.date': { greater_than_equal: parametres.depuis.toISOString() } })
  if (parametres.avant) conditions.push({ 'seance.date': { less_than: parametres.avant.toISOString() } })

  const payload = await getPayload({ config: configPromise })
  const presences = await payload.find({
    collection: 'presences',
    // Séance (et son prof) et élève peuplés pour les libellés
    depth: 2,
    limit: 0,
    overrideAccess: false,
    pagination: false,
    user,
    where: conditions.length > 0 ? { and: conditions } : undefined,
  })

  const nom = nomFichierCsv(parametres.eleveId ? `presences-eleve-${parametres.eleveId}` : 'presences')
  return new Response(versCsv(lignesExportPresences(presences.docs as Parameters<typeof lignesExportPresences>[0])), {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="${nom}"`,
      'Content-Type': 'text/csv; charset=utf-8',
    },
  })
}
