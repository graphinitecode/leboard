import type { Seance, SeanceDetail, StatutPresence } from '@/seances/domain/seance.entity'
import { libelleRegle } from '@/seances/domain/recurrence'

export interface SeanceLigneViewModel {
  id: number
  dateLabel: string
  dateLongueLabel: string
  date: Date
  heureLabel: string
  creneauLabel: string
  dureeMin: number | null
  matiereLabel: string
  profLabel: string | null
  retourPresent: boolean
  /** « Chaque semaine le mardi, sans fin » ; null pour une séance ponctuelle. */
  repetitionLabel: string | null
}

export interface PresenceViewModel {
  eleveId: number
  eleveNom: string
  presenceId: number | null
  statutInitial: StatutPresence | null
  commentaire: string | null
}

export interface SeanceDetailViewModel {
  seance: SeanceLigneViewModel
  presences: PresenceViewModel[]
  aEleves: boolean
  /** Libellé du (des) groupe(s) d'après les élèves (« CM2 · Groupe B »). */
  groupeLabel: string | null
  totalEleves: number
  nbPresents: number
  nbAbsents: number
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

export const statutPresenceColor = (statut: StatutPresence): 'green' | 'red' | 'yellow' => {
  if (statut === 'present') return 'green'
  if (statut === 'absent-justifie') return 'yellow'
  return 'red'
}

// Créneau horaire (« 17h00 – 18h00 »), simple heure si la durée est absente.
export const creneauSeance = (date: Date, dureeMin: number | null): string => {
  const debut = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (!dureeMin || dureeMin <= 0) return debut
  const fin = new Date(date.getTime() + dureeMin * 60000)
  return `${debut} – ${fin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
}

export const presentSeanceLigne = (seance: Seance): SeanceLigneViewModel => {
  const date = new Date(seance.date)
  return {
    id: seance.id,
    date: date,
    dateLabel: date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    dateLongueLabel: date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    heureLabel: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    creneauLabel: creneauSeance(date, seance.duree ?? null),
    dureeMin: seance.duree ?? null,
    matiereLabel: matiereLabels[seance.matiere] ?? seance.matiere,
    profLabel: seance.profLabel ?? null,
    retourPresent: seance.aRetour,
    repetitionLabel: seance.serie ? libelleRepetition(seance.serie) : null,
  }
}

const libelleRepetition = (serie: NonNullable<Seance['serie']>): string => {
  const regle = libelleRegle(serie.frequence, serie.premiere)
  if (!serie.fin) return `${regle}, sans fin`
  const fin = new Date(`${serie.fin}T12:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${regle}, jusqu’au ${fin}`
}

export const presentSeanceDetail = (detail: SeanceDetail): SeanceDetailViewModel => {
  const presencesParEleve = new Map(
    detail.presences.map((presence) => [presence.eleveId, presence]),
  )

  // Libellé de groupe déduit des élèves (« CM2 · Groupe B ») — toutes les
  // combinaisons uniques niveau · groupe, jointes si plusieurs groupes.
  const labelsGroupes = [
    ...new Set(
      detail.elevesDuGroupe
        .map((eleve) => [eleve.niveau ?? null, eleve.groupe ?? null].filter(Boolean).join(' · '))
        .filter(Boolean),
    ),
  ]
  const nbPresents = detail.presences.filter((presence) => presence.present === 'present').length

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
        commentaire: presence?.commentaire ?? null,
      }
    }),
    groupeLabel: labelsGroupes.length > 0 ? labelsGroupes.join(', ') : null,
    totalEleves: detail.elevesDuGroupe.length,
    nbPresents: nbPresents,
    nbAbsents: detail.presences.length - nbPresents,
  }
}