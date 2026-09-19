import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { requireProf } from '@/utilities/profAuth'

import { BoutonSupprimerDispo, FormDispo } from './FormDispo'

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
    <main style={{ maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <p>
        <Link href="/profs">← Mes séances</Link>
      </p>
      <h1>Mes disponibilités</h1>
      <p>
        <small>Créneaux hebdomadaires où vous êtes disponible. L’association les utilise pour
        planifier les séances.</small>
      </p>

      {dispos.length === 0 ? (
        <p>Aucune disponibilité déclarée.</p>
      ) : (
        <ul style={{ display: 'grid', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
          {dispos.map((dispo, index) => (
            <li
              className="govfr-ligne-eleve"
              key={`${dispo.jour}-${dispo.heureDebut}-${index}`}
            >
              <span style={{ textTransform: 'capitalize' }}>
                {dispo.jour} · {dispo.heureDebut} → {dispo.heureFin}
              </span>
              <BoutonSupprimerDispo index={index} />
            </li>
          ))}
        </ul>
      )}

      <h2>Ajouter</h2>
      <FormDispo />
    </main>
  )
}