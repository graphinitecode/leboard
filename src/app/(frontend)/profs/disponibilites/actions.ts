'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getMeUserServer } from '@/utilities/profAuth'

export async function ajouterDisponibilite(formData: FormData) {
  const user = await getMeUserServer()
  if (!user) {
    return { ok: false, erreur: 'Non authentifié.' }
  }

  const jour = String(formData.get('jour') ?? '')
  const heureDebut = String(formData.get('heureDebut') ?? '')
  const heureFin = String(formData.get('heureFin') ?? '')

  if (!jour || !heureDebut || !heureFin) {
    return { ok: false, erreur: 'Tous les champs sont requis.' }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const me = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const dispos = [
      ...(me.disponibilites ?? []),
      { heureDebut, heureFin, jour: jour as 'lundi' },
    ]

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { disponibilites: dispos },
      overrideAccess: false,
      user,
    })

    revalidatePath('/profs/disponibilites')
    return { ok: true }
  } catch {
    return { ok: false, erreur: 'Échec de l’enregistrement.' }
  }
}

export async function supprimerDisponibilite(index: number) {
  const user = await getMeUserServer()
  if (!user) {
    return { ok: false, erreur: 'Non authentifié.' }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const me = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const dispos = [...(me.disponibilites ?? [])]
    dispos.splice(index, 1)

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { disponibilites: dispos },
      overrideAccess: false,
      user,
    })

    revalidatePath('/profs/disponibilites')
    return { ok: true }
  } catch {
    return { ok: false, erreur: 'Échec de la suppression.' }
  }
}