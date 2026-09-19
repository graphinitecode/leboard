'use server'

import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getMeUserServer } from '@/utilities/profAuth'

function texteVersLexical(texte: string) {
  return {
    root: {
      children: [
        {
          children: [{ detail: 0, format: 0, mode: 'normal', style: '', text: texte, type: 'text' }],
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

export async function changerPresence(presenceId: number | string, statut: string) {
  const user = await getMeUserServer()
  if (!user || (user.role !== 'prof' && user.role !== 'admin')) {
    return { ok: false, erreur: 'Non autorisé.' }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'presences',
      id: presenceId,
      data: { present: statut as 'present' },
      overrideAccess: false,
      user,
    })
    revalidatePath('/profs')
    return { ok: true }
  } catch {
    return { ok: false, erreur: 'Échec de l’enregistrement.' }
  }
}

export async function enregistrerRetour(seanceId: number | string, retour: string) {
  const user = await getMeUserServer()
  if (!user || (user.role !== 'prof' && user.role !== 'admin')) {
    return { ok: false, erreur: 'Non autorisé.' }
  }

  const payload = await getPayload({ config: configPromise })

  try {
    await payload.update({
      collection: 'seances',
      id: seanceId,
      data: { retour: texteVersLexical(retour) as never },
      overrideAccess: false,
      user,
    })
    revalidatePath(`/profs/seances/${seanceId}`)
    return { ok: true }
  } catch {
    return { ok: false, erreur: 'Échec de l’enregistrement.' }
  }
}

export async function ajouterProgression(formData: FormData) {
  const user = await getMeUserServer()
  if (!user || (user.role !== 'prof' && user.role !== 'admin')) {
    return { ok: false, erreur: 'Non autorisé.' }
  }

  const payload = await getPayload({ config: configPromise })

  const eleveId = String(formData.get('eleve') ?? '')
  const competenceId = String(formData.get('competence') ?? '')
  const niveau = String(formData.get('niveau') ?? '')
  const seanceId = String(formData.get('seance') ?? '')
  const commentaire = String(formData.get('commentaire') ?? '')

  if (!eleveId || !competenceId || !niveau) {
    return { ok: false, erreur: 'Élève, compétence et niveau requis.' }
  }

  try {
    await payload.create({
      collection: 'progressions',
      data: {
        commentaire: commentaire || undefined,
        competence: competenceId as unknown as number,
        date: new Date().toISOString(),
        eleve: eleveId as unknown as number,
        niveau: niveau as 'acquis',
        seance: seanceId ? (seanceId as unknown as number) : undefined,
      },
      overrideAccess: false,
      user,
    })
    revalidatePath(`/profs/seances/${seanceId}`)
    return { ok: true }
  } catch {
    return { ok: false, erreur: 'Échec de l’enregistrement.' }
  }
}