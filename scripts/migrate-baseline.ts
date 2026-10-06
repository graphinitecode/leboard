/* Marque la migration initiale comme appliquée sur une base dont le schéma
   existe déjà (créé auparavant par la synchronisation du mode dev).
   Usage : pnpm migrate:baseline          → affiche l'état, ne modifie rien
           APPLY=1 pnpm migrate:baseline → enregistre la migration initiale
   À lancer une seule fois par base existante. */
import { getPayload } from 'payload'

import config from '../src/payload.config'
import { migrations } from '../src/migrations'

// Variable d'environnement : payload run ne transmet pas les arguments au script
const apply = process.env.APPLY === '1'

async function main() {
  const payload = await getPayload({ config })
  const baseline = migrations[0]?.name
  if (!baseline) throw new Error('Aucune migration dans src/migrations')

  const { docs } = await payload.find({
    collection: 'payload-migrations',
    limit: 100,
    pagination: false,
  })
  console.log('payload_migrations :', docs.map((d) => `${d.name} (batch ${d.batch})`))

  if (docs.some((d) => d.name === baseline)) {
    console.log(`${baseline} est déjà enregistrée, rien à faire.`)
    process.exit(0)
  }

  if (!apply) {
    console.log(`Simulation : ${baseline} serait enregistrée (batch 1) et la ligne « dev » supprimée. Relancer avec APPLY=1.`)
    process.exit(0)
  }

  // La ligne « dev » (batch -1) signale un schéma poussé par le mode dev :
  // laissée en place, payload migrate demanderait une confirmation interactive
  await payload.delete({ collection: 'payload-migrations', where: { batch: { equals: -1 } } })
  await payload.create({ collection: 'payload-migrations', data: { batch: 1, name: baseline } })
  console.log(`${baseline} enregistrée comme appliquée.`)
  process.exit(0)
}

// Top-level await : payload run termine le process dès la fin de l'import
await main().catch((error) => {
  console.error(error)
  process.exit(1)
})
