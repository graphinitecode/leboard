import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'

import ElevesView from './ElevesView'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mes élèves — LPV Board' }

export default async function ElevesPage({
  searchParams,
}: {
  searchParams: Promise<{ retour?: string }>
}) {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  // Origine de navigation (?retour=/rapports) : le lien « Retour » renvoie au
  // tableau de bord par défaut, ou à l'écran d'où l'utilisateur vient —
  // chemin interne uniquement (anti open-redirect : doit commencer par « / »).
  const { retour: retourParam } = await searchParams
  const retour =
    retourParam && retourParam.startsWith('/') && !retourParam.startsWith('//')
      ? retourParam
      : '/profs'

  // Alertes de décrochage des élèves référents, chargées côté serveur
  // (la collection alertes est adminOnly : le client ne peut pas la requêter ;
  // même dérogation encadrée que le dashboard, filtre profReferent — spec 10c).
  const alertes = await payload
    .find({
      collection: 'alertes',
      depth: 0,
      limit: 100,
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

  const alertesVm = (alertes?.docs ?? []).map((alerte) => ({
    eleveId: alerte.eleve as unknown as number,
    id: alerte.id,
    message: alerte.message ?? '',
  }))

  return <ElevesView alertes={alertesVm} profId={user.id} retour={retour} />
}