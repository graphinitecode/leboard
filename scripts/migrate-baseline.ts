/* Marque une migration comme appliquée sur une base dont le schéma la contient
   déjà (poussé auparavant par la synchronisation du mode dev), et retire la
   ligne « dev » qui bloque payload migrate.
   Usage : pnpm migrate:baseline                     → affiche l'état, ne modifie rien
           APPLY=1 pnpm migrate:baseline             → enregistre la migration initiale
           APPLY=1 MIGRATION=<nom> pnpm migrate:baseline → enregistre la migration <nom> */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { migrations } from '../src/migrations'

// Variables d'environnement : payload run ne transmet pas les arguments au script
const apply = process.env.APPLY === '1'
const cible = process.env.MIGRATION || migrations[0]?.name

async function main() {
  const payload = await getPayload({ config })
  if (!cible || !migrations.some((m) => m.name === cible)) {
    throw new Error(`Migration inconnue dans src/migrations : ${cible ?? '(aucune)'}`)
  }

  const { docs } = await payload.find({
    collection: 'payload-migrations',
    limit: 100,
    pagination: false,
  })
  console.log('payload_migrations :', docs.map((d) => `${d.name} (batch ${d.batch})`))

  const dejaEnregistree = docs.some((d) => d.name === cible)
  const ligneDev = docs.some((d) => d.batch === -1)
  if (dejaEnregistree && !ligneDev) {
    console.log(`${cible} est déjà enregistrée, rien à faire.`)
    process.exit(0)
  }

  const batch = Math.max(0, ...docs.map((d) => d.batch ?? 0)) + 1
  if (!apply) {
    console.log(
      `Simulation : ${dejaEnregistree ? '' : `${cible} serait enregistrée (batch ${batch}), `}la ligne « dev » serait supprimée. Relancer avec APPLY=1.`,
    )
    process.exit(0)
  }

  // La ligne « dev » (batch -1) signale un schéma poussé par le mode dev :
  // laissée en place, payload migrate demanderait une confirmation interactive
  await payload.delete({ collection: 'payload-migrations', where: { batch: { equals: -1 } } })
  if (!dejaEnregistree) {
    await payload.create({ collection: 'payload-migrations', data: { batch, name: cible } })
  }
  console.log(`${cible} enregistrée comme appliquée, ligne « dev » supprimée.`)
  process.exit(0)
}

// Top-level await : payload run termine le process dès la fin de l'import
await main().catch((error) => {
  console.error(error)
  process.exit(1)
})
