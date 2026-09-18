import type { PayloadRequest } from 'payload'

interface PresenceData {
  eleve?: string | number
  seance?: string | number
}

export async function verifierUnicitePresence(args: {
  data: PresenceData
  req: PayloadRequest
  id?: string | number
}): Promise<string | true> {
  const { data, req, id } = args
  const eleveId = data.eleve
  const seanceId = data.seance

  if (!eleveId || !seanceId) return true

  const existantes = await req.payload.find({
    collection: 'presences',
    depth: 0,
    limit: 1,
    where: {
      and: [
        { eleve: { equals: eleveId } },
        { seance: { equals: seanceId } },
        ...(id ? [{ id: { not_equals: id } }] : []),
      ],
    },
  })

  if (existantes.totalDocs > 0) {
    return 'Présence déjà enregistrée pour cet élève sur cette séance.'
  }

  return true
}