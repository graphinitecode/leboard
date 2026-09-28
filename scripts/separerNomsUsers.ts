import type { Payload } from 'payload'

// One-shot : découpe les `name` existants en prenom/nom puis re-dérive `name`.
// Exécution : pnpm payload run ./scripts/separerNomsUsers.ts
export default async function separerNomsUsers(payload: Payload): Promise<void> {
  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
  })

  let modifiés = 0

  for (const user of users.docs) {
    const name = (user.name ?? '').trim()

    // Nom déjà renseigné et name déjà dérivé → rien à faire
    if (user.prenom && user.nom) {
      continue
    }

    if (!name) {
      payload.logger.warn({ msg: `User ${user.id} sans nom, ignoré` })
      continue
    }

    const mots = name.split(/\s+/)
    const prenom = mots[0]
    const nom = mots.slice(1).join(' ')

    await payload.update({
      collection: 'users',
      data: {
        nom: nom || prenom,
        prenom,
      },
      id: user.id,
      overrideAccess: true,
    })

    modifiés += 1
  }

  payload.logger.info({ msg: `Users mis à jour : ${modifiés}/${users.docs.length}` })
}