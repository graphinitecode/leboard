import type { Payload } from 'payload'

// Calculs du rapport élève (Spec 08) — génération à la volée, aucune persistance

interface StatsPresences {
  attendues: number
  presentes: number
  absences: number
  absencesJustifiees: number
  taux: number | null
}

export async function calculerPresencesEleve(
  payload: Payload,
  eleveId: number | string,
  periodeDebut: Date,
  periodeFin: Date,
): Promise<StatsPresences> {
  const seances = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 0,
    sort: '-date',
    where: {
      and: [
        { groupe: { equals: eleveId } },
        { date: { greater_than_equal: periodeDebut.toISOString() } },
        { date: { less_than_equal: periodeFin.toISOString() } },
      ],
    },
  })

  const presences = await payload.find({
    collection: 'presences',
    depth: 0,
    limit: 0,
    where: { eleve: { equals: eleveId } },
  })

  const parSeance = new Map(presences.docs.map((p) => [String(p.seance), p.present as string]))

  let presentes = 0
  let absences = 0
  let absencesJustifiees = 0

  for (const seance of seances.docs) {
    const statut = parSeance.get(String(seance.id))
    if (statut === 'present') presentes++
    else if (statut === 'absent-justifie') {
      absences++
      absencesJustifiees++
    } else if (statut === 'absent') absences++
  }

  const attendues = seances.docs.length

  return {
    absences,
    absencesJustifiees,
    attendues,
    presentes,
    taux: attendues > 0 ? Math.round((presentes / attendues) * 100) : null,
  }
}

export function trimestreCourant(): { debut: Date; fin: Date } {
  const maintenant = new Date()
  const mois = Math.floor(maintenant.getMonth() / 3) * 3
  const debut = new Date(maintenant.getFullYear(), mois, 1)
  const fin = new Date(maintenant.getFullYear(), mois + 3, 0, 23, 59, 59)
  return { debut, fin }
}

// Extrait le texte brut d'un document lexical
export function texteLexical(retour: unknown): string {
  if (typeof retour === 'string') return retour
  if (!retour || typeof retour !== 'object') return ''

  const root = (retour as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''

  function texte(node: unknown): string {
    if (typeof node === 'string') return node
    if (!node || typeof node !== 'object') return ''
    const n = node as { text?: string; children?: unknown[] }
    if (typeof n.text === 'string') return n.text
    return (n.children ?? []).map(texte).join('')
  }

  return root.children.map(texte).filter(Boolean).join('\n')
}

export function niveauLabel(niveau: string): string {
  switch (niveau) {
    case 'acquis':
      return 'Acquis'
    case 'en-cours':
      return 'En cours'
    default:
      return 'À revoir'
  }
}