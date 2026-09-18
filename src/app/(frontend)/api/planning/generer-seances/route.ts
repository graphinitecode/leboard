import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'payload-token'
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({
    headers: new Headers({ Authorization: `JWT ${token}` } as unknown as HeadersInit),
  })

  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Réservé aux administrateurs.' }, { status: 403 })
  }

  const body = (await req.json().catch(() => null)) as
    | { periodeDebut?: string; periodeFin?: string }
    | null

  const debut = body?.periodeDebut ? new Date(body.periodeDebut) : null
  const fin = body?.periodeFin ? new Date(body.periodeFin) : null

  if (!debut || !fin || Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin < debut) {
    return Response.json(
      { error: 'periodeDebut et periodeFin (ISO) valides requis.' },
      { status: 400 },
    )
  }

  const creneaux = await payload.find({
    collection: 'creneaux',
    depth: 0,
    limit: 0,
    where: { actif: { equals: true } },
  })

  let creees = 0
  let ignorees = 0

  // Chaque jour de la période
  for (const jour = new Date(debut); jour <= fin; jour.setDate(jour.getDate() + 1)) {
    const nomJour = jour.toLocaleDateString('fr-FR', { weekday: 'long' })

    for (const creneau of creneaux.docs) {
      if (creneau.jour !== nomJour) continue

      const dateSeance = new Date(jour)
      const [h, m] = (creneau.heureDebut as string).split(':').map((p) => parseInt(p, 10))
      dateSeance.setHours(h || 0, m || 0, 0, 0)

      // Idempotence : une séance existe déjà pour ce créneau à cette date ?
      const existante = await payload.find({
        collection: 'seances',
        depth: 0,
        limit: 1,
        where: {
          and: [{ date: { equals: dateSeance.toISOString() } }, { matiere: { equals: creneau.matiere } }],
        },
      })

      if (existante.totalDocs > 0) {
        ignorees++
        continue
      }

      const groupeIds = (creneau.groupe ?? []).map((eleve) =>
        typeof eleve === 'object' ? eleve.id : eleve,
      )

      await payload.create({
        collection: 'seances',
        data: {
          date: dateSeance.toISOString(),
          groupe: groupeIds,
          matiere: creneau.matiere as 'maths',
          prof: (typeof creneau.prof === 'object' ? creneau.prof?.id : creneau.prof) as number,
        },
        overrideAccess: true,
      })
      creees++
    }
  }

  payload.logger.info({ creees, ignorees, msg: 'génération séances' })

  return Response.json({
    creees,
    ignorees,
    ok: true,
    periode: { debut: debut.toISOString(), fin: fin.toISOString() },
  })
}