import { getPayload } from 'payload'
import config from '@payload-config'

import {
  detecterDecrochage,
  detecterRappelsPreventifs,
  detecterRetardsBibliotheque,
  resoudreAlertesPretsRendus,
} from '@/utilities/alertes'
import { detecterFinRetention } from '@/utilities/detecterFinRetention'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config })

  // Résolutions d'abord : évite de recréer une alerte pour une cause déjà disparue
  const resoluesAuto = await resoudreAlertesPretsRendus(payload)

  const [decrochage, retards, rappels, rgpdRetention] = await Promise.all([
    detecterDecrochage(payload),
    detecterRetardsBibliotheque(payload),
    detecterRappelsPreventifs(payload),
    detecterFinRetention(payload),
  ])

  payload.logger.info({
    msg: 'cron alertes exécuté',
    creees: { decrochage, retards, rappels, rgpdRetention },
    resoluesAuto,
  })

  return Response.json({
    ok: true,
    creees: { decrochage, retards, rappels, rgpdRetention },
    resoluesAuto,
  })
}