import type { Seance, SeanceDetail, StatutPresence } from '@/seances/domain/seance.entity'

export interface SeanceLigneViewModel {
  id: number
  dateLabel: string
  date: Date
  matiereLabel: string
  retourPresent: boolean
}

export interface PresenceViewModel {
  eleveId: number
  eleveNom: string
  presenceId: number | null
  statutInitial: StatutPresence | null
}

export interface SeanceDetailViewModel {
  seance: SeanceLigneViewModel
  presences: PresenceViewModel[]
  aEleves: boolean
}

const matiereLabels: Record<string, string> = {
  maths: 'Maths',
  francais: 'Français',
  anglais: 'Anglais',
  autre: 'Autre',
}

export const statutPresenceLabel = (statut: StatutPresence): string => {
  if (statut === 'present') return 'Présent'
  if (statut === 'absent-justifie') return 'Absent (justifié)'
  return 'Absent'
}

export const presentSeanceLigne = (seance: Seance): SeanceLigneViewModel => ({
  id: seance.id,
  date: new Date(seance.date),
  dateLabel: new Date(seance.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
  matiereLabel: matiereLabels[seance.matiere] ?? seance.matiere,
  retourPresent: seance.aRetour,
})

export const presentSeanceDetail = (detail: SeanceDetail): SeanceDetailViewModel => {
  const presencesParEleve = new Map(
    detail.presences.map((presence) => [presence.eleveId, presence]),
  )

  return {
    seance: presentSeanceLigne(detail.seance),
    aEleves: detail.elevesDuGroupe.length > 0,
    presences: detail.elevesDuGroupe.map((eleve) => {
      const presence = presencesParEleve.get(eleve.id)
      return {
        eleveId: eleve.id,
        eleveNom: `${eleve.prenom} ${eleve.nom}`,
        presenceId: presence?.id ?? null,
        statutInitial: presence?.present ?? null,
      }
    }),
  }
}