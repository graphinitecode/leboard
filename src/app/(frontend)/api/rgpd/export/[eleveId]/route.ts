import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'payload-token'

async function getUser(payload: import('payload').Payload) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
  })
  return user ?? null
}

export async function GET(req: Request, { params }: { params: Promise<{ eleveId: string }> }) {
  const { eleveId } = await params

  const payload = await getPayload({ config })
  const user = await getUser(payload)

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Réservé aux administrateurs.' }, { status: 403 })
  }

  const eleve = await payload.findByID({
    collection: 'eleves',
    id: eleveId,
    depth: 2,
    overrideAccess: true,
  })

  const presences = await payload.find({
    collection: 'presences',
    depth: 1,
    limit: 0,
    where: { eleve: { equals: eleveId } },
    sort: '-createdAt',
  })

  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 0,
    where: { groupe: { equals: eleveId } },
    sort: '-date',
  })

  const exportData = {
    eleve,
    presences: presences.docs,
    seances: seances.docs,
    exporteLe: new Date().toISOString(),
    version: '1',
  }

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Disposition': `attachment; filename="eleve-${eleveId}-rgpd.json"`,
      'Content-Type': 'application/json',
    },
  })
}