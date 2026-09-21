import type { StatsPresencesEleve } from '@/rapports/domain/rapport.entity'
import { rapportsRepository } from '@/rapports/infrastructure/rapports.repository'

export const trimestreCourant = (): { debut: Date; fin: Date } => {
  const maintenant = new Date()
  const mois = Math.floor(maintenant.getMonth() / 3) * 3
  const debut = new Date(maintenant.getFullYear(), mois, 1)
  const fin = new Date(maintenant.getFullYear(), mois + 3, 0, 23, 59, 59)
  return { debut, fin }
}

export const calculerPresencesEleveHandler = async (
  eleveId: number,
  periodeDebut: Date,
  periodeFin: Date,
): Promise<StatsPresencesEleve> => {
  return rapportsRepository.calculerPresencesEleve(eleveId, periodeDebut, periodeFin)
}