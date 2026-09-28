import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'
import ProfsDashboardView from './ProfsDashboardView'

export const dynamic = 'force-dynamic'

// Vue serveur du tableau de bord prof : identité (salutation) et alertes
// de décrochage des élèves référents (dérogation encadrée par le filtre
// profReferent — même pattern que la fiche élève, spec 10c).
export default async function ProfsDashboard() {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  const alertes = await payload
    .find({
      collection: 'alertes',
      depth: 1,
      limit: 10,
      overrideAccess: true,
      sort: '-dateCreation',
      where: {
        and: [
          { statut: { not_equals: 'traitee' } },
          { type: { equals: 'decrochage' } },
          { 'eleve.profReferent': { equals: user.id } },
        ],
      },
    })
    .catch(() => null)

  const alertesVm = (alertes?.docs ?? []).map((alerte) => {
    const eleve = alerte.eleve as unknown as { id: number; prenom: string; nom: string }
    return {
      eleveId: eleve?.id ?? 0,
      eleveLabel: eleve ? `${eleve.prenom} ${eleve.nom.charAt(0)}.` : 'Élève',
      message: alerte.message ?? '',
    }
  })

  return <ProfsDashboardView alertes={alertesVm} prenom={user.prenom} />
}