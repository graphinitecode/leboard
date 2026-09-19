import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'
import { InsetText } from '@/components/atoms'
import { FormDispo, BoutonSupprimerDispo } from '@/components/organisms/FormulairesDispo'

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
      ) : (
        <div>
          {dispos.map((dispo, index) => (
            <div className="lpv-ligne" key={`${dispo.jour}-${dispo.heureDebut}-${index}`}>
              <span style={{ textTransform: 'capitalize' }}>
                <strong>{dispo.jour}</strong>
                <span style={{ color: 'var(--lpv-text-muted)' }}>
                  {' '}
                  · {dispo.heureDebut} → {dispo.heureFin}
                </span>
              </span>
              <BoutonSupprimerDispo index={index} />
            </div>
          ))}
        </div>
      )}

      <h2 className="lpv-h2">Ajouter</h2>
      <FormDispo />
    </>
  )
}