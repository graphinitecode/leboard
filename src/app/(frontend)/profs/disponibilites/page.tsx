import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'
import { InsetText } from '@/components/atoms'
import { ListeDispos } from '@/components/organisms/FormulairesDispo'

export const dynamic = 'force-dynamic'

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export default async function DisponibilitesPage() {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  const me = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: false,
    user,
  })

  const dispos = [...(me.disponibilites ?? [])].sort(
    (a, b) => JOURS.indexOf(a.jour) - JOURS.indexOf(b.jour) || a.heureDebut.localeCompare(b.heureDebut),
  )

  return (
    <>
      <h1 className="lpv-h1">Mes disponibilités</h1>
      <p className="lpv-muted">
        Créneaux hebdomadaires où vous êtes disponible. L&rsquo;association les utilise pour
        planifier les séances.
      </p>

      {dispos.length === 0 ? (
        <InsetText>Aucune disponibilité déclarée.</InsetText>
      ) : null}

      <ListeDispos dispos={dispos.map((dispo) => ({
        heureDebut: dispo.heureDebut,
        heureFin: dispo.heureFin,
        jour: dispo.jour,
      }))} />
    </>
  )
}