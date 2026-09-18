import { getPayload } from 'payload'
import config from '@payload-config'

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

  const rgpdRetention = await detecterFinRetention(payload)

  payload.logger.info({ msg: 'cron alertes exécuté', rgpdRetention })

  return Response.json({
    ok: true,
    alertes: { rgpdRetention },
  })
}