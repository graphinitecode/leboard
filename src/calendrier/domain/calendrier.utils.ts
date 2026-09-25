import type {
  BandeDispo,
  CibleCreneau,
  EventCalendrier,
  MatiereCalendrier,
  PlageSelectionnee,
} from './calendrier.entity'

export const HEURE_DEBUT_GRILLE = 8
export const HEURE_FIN_GRILLE = 20
export const MINUTES_CRENEAU = 30
export const DUREE_DEFAUT = 60
export const JOURS_GRILLE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const

// Renvoie le lundi de la semaine contenant la date donnée, à 00:00 locale.
export const debutSemaine = (date: Date): Date => {
  const copie = new Date(date)
  const jour = (copie.getDay() + 6) % 7
  copie.setDate(copie.getDate() - jour)
  copie.setHours(0, 0, 0, 0)
  return copie
}

// Ajoute n semaines (7n jours) à la date donnée.
export const ajouterSemaines = (date: Date, n: number): Date => {
  const copie = new Date(date)
  copie.setDate(copie.getDate() + 7 * n)
  return copie
}

// Bornes de la fenêtre de requête : lundi 00:00 → dimanche 23:59:59.999.
export const bornesSemaine = (lundi: Date): { debut: Date; fin: Date } => {
  const fin = new Date(lundi)
  fin.setDate(fin.getDate() + 6)
  fin.setHours(23, 59, 59, 999)
  return { debut: lundi, fin }
}

// Index du jour de la grille (0 = lundi … 5 = samedi) ou null si hors grille.
export const indexJourGrille = (date: Date): number | null => {
  const index = (date.getDay() + 6) % 7
  return index < JOURS_GRILLE.length ? index : null
}

// Renvoie les séances tombant dans la semaine (bornes incluses).
export const filtrerSemaine = (events: EventCalendrier[], lundi: Date): EventCalendrier[] => {
  const { debut, fin } = bornesSemaine(lundi)
  return events.filter((e) => e.debut >= debut && e.debut <= fin)
}

// Position verticale d'une séance, bornée à la grille (en minutes depuis 8h).
export const positionMinutes = (date: Date): number => {
  const minutes = date.getHours() * 60 + date.getMinutes()
  const base = HEURE_DEBUT_GRILLE * 60
  if (minutes < base) return 0
  const finGrille = HEURE_FIN_GRILLE * 60
  if (minutes >= finGrille) return finGrille - base
  return minutes - base
}

// Durée bornée à la fin de la grille (en minutes, minimum un créneau).
export const dureeBornee = (dureeMin: number): number =>
  Math.min(Math.max(dureeMin, MINUTES_CRENEAU), (HEURE_FIN_GRILLE - HEURE_DEBUT_GRILLE) * 60)

// Arrondit une date au créneau inférieur (30 min) pour une cible de dépôt.
export const arrondirAuCreneau = (date: Date): { heureDebut: string; jourIndex: number } => {
  const minutes = date.getHours() * 60 + date.getMinutes()
  const creneau = Math.floor(minutes / MINUTES_CRENEAU) * MINUTES_CRENEAU
  const heure = String(Math.floor(creneau / 60)).padStart(2, '0')
  const minute = String(creneau % 60).padStart(2, '0')
  return { heureDebut: `${heure}:${minute}`, jourIndex: indexJourGrille(date) ?? 0 }
}

// Construit la cible de dépôt à partir du chemin de colonne/rangée.
export const cibleDepuisCases = (jourIndex: number, heureDebut: string): CibleCreneau => ({
  jourIndex,
  heureDebut,
})

// Deux séances se chevauchent-elles ? (comparaison sur un même jour)
export const seChevauchent = (a: EventCalendrier, b: EventCalendrier): boolean => {
  const aFin = a.debut.getTime() + a.dureeMin * 60_000
  const bFin = b.debut.getTime() + b.dureeMin * 60_000
  return a.debut < new Date(bFin) && b.debut < new Date(aFin)
}

// Détecte un chevauchement entre une nouvelle séance et la liste existante.
export const chevaucheUne = (
  candidat: { debut: Date; dureeMin: number },
  events: EventCalendrier[],
  ignorerId?: number,
): EventCalendrier | null => {
  const nouvelle: EventCalendrier = {
    id: ignorerId ?? -1,
    debut: candidat.debut,
    dureeMin: candidat.dureeMin,
    matiere: 'autre',
    labelGroupe: '',
    href: '',
  }
  return events.find((e) => e.id !== nouvelle.id && seChevauchent(nouvelle, e)) ?? null
}

// Nouvelle date après déplacement : jour de la colonne cible + heure choisie.
export const dateCiblee = (lundi: Date, cible: CibleCreneau): Date => {
  const [h, m] = cible.heureDebut.split(':').map(Number)
  const date = new Date(lundi)
  date.setDate(date.getDate() + cible.jourIndex)
  date.setHours(h ?? 0, m ?? 0, 0, 0)
  return date
}

// Heures d'une bande dispos en minutes depuis minuit.
export const minutesDepuisMinuit = (heure: string): number => {
  const [h, m] = heure.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

// Bandes dispos converties en bornes minutes [debut, fin] depuis minuit.
export const bandeEnMinutes = (bande: BandeDispo): [number, number] => [
  minutesDepuisMinuit(bande.heureDebut),
  minutesDepuisMinuit(bande.heureFin),
]

// Libellé « Semaine du 23 au 28 septembre » (mois répété condensé).
export const labelSemaine = (lundi: Date): string => {
  const fin = new Date(lundi)
  fin.setDate(fin.getDate() + 5)
  const fmtJourMois = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  const debutLabel = fmtJourMois(lundi)
  const finLabel = fmtJourMois(fin)
  if (lundi.getMonth() === fin.getMonth()) {
    return `Semaine du ${lundi.getDate()} au ${finLabel}`
  }
  return `Semaine du ${debutLabel} au ${finLabel}`
}

// Rangées de la grille : heure de début de chaque créneau affiché.
export const rangeesGrille = (): string[] => {
  const rangees: string[] = []
  for (let m = HEURE_DEBUT_GRILLE * 60; m < HEURE_FIN_GRILLE * 60; m += MINUTES_CRENEAU) {
    const heure = String(Math.floor(m / 60)).padStart(2, '0')
    const minute = String(m % 60).padStart(2, '0')
    rangees.push(`${heure}:${minute}`)
  }
  return rangees
}

// Couleur de pastille par matière (token CSS de la palette LPV).
export const couleurMatiere = (matiere: MatiereCalendrier): string => {
  switch (matiere) {
    case 'maths':
      return 'blue'
    case 'francais':
      return 'violet'
    case 'anglais':
      return 'orange'
    default:
      return 'teal'
  }
}

// Normalise une matière inconnue vers 'autre'.
export const matiereFiable = (valeur: string): MatiereCalendrier =>
  (['maths', 'francais', 'anglais'] as MatiereCalendrier[]).includes(valeur as MatiereCalendrier)
    ? (valeur as MatiereCalendrier)
    : 'autre'

// Liste des jours (dates) affichés pour la semaine donnée.
export const joursGrille = (lundi: Date): Date[] =>
  JOURS_GRILLE.map((_, i) => {
    const d = new Date(lundi)
    d.setDate(d.getDate() + i)
    return d
  })

// Ajoute n jours à la date donnée.
export const ajouterJours = (date: Date, n: number): Date => {
  const copie = new Date(date)
  copie.setDate(copie.getDate() + n)
  return copie
}

// Index de rangée (créneau de 30 min) depuis une heure « HH:mm ».
export const rangeeDepuisHeure = (heure: string): number => {
  const [h, m] = heure.split(':').map(Number)
  const minutes = (h ?? 0) * 60 + (m ?? 0)
  return Math.floor((minutes - HEURE_DEBUT_GRILLE * 60) / MINUTES_CRENEAU)
}

// Heure « HH:mm » depuis un index de rangée (borné à la grille).
export const heureDepuisRangee = (rangee: number): string => {
  const index = Math.min(Math.max(rangee, 0), (HEURE_FIN_GRILLE - HEURE_DEBUT_GRILLE) * 60 / MINUTES_CRENEAU - 1)
  const minutes = HEURE_DEBUT_GRILLE * 60 + index * MINUTES_CRENEAU
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Plage (rangées début inclus → fin exclusive) depuis deux créneaux d'une même colonne.
export const plageDepuisCases = (debut: number, fin: number): { rangeeDebut: number; rangeeFin: number } => ({
  rangeeDebut: Math.min(debut, fin),
  rangeeFin: Math.max(debut, fin) + 1,
})

// Convertit une plage sélectionnée en brouillon d'assistant (heures « HH:mm »).
export const brouillonDepuisPlage = (plage: PlageSelectionnee): { jourIndex: number; heureDebut: string; heureFin: string } => ({
  jourIndex: plage.jourIndex,
  heureDebut: heureDepuisRangee(plage.rangeeDebut),
  heureFin: heureDepuisRangee(plage.rangeeFin),
})

// Durée en minutes d'une plage (minimum un créneau).
export const dureePlage = (plage: PlageSelectionnee): number =>
  Math.max((plage.rangeeFin - plage.rangeeDebut) * MINUTES_CRENEAU, MINUTES_CRENEAU)

// Séances d'un jour de la semaine, triées par heure de début (vue liste).
export const seancesDuJourTriees = (events: EventCalendrier[], jourIndex: number): EventCalendrier[] =>
  events
    .filter((e) => indexJourGrille(e.debut) === jourIndex)
    .sort((a, b) => a.debut.getTime() - b.debut.getTime())

// Jours de la semaine (index 0..5) ayant au moins une séance.
export const joursAvecSeances = (events: EventCalendrier[]): number[] => {
  const presents = new Set<number>()
  events.forEach((e) => {
    const index = indexJourGrille(e.debut)
    if (index !== null) presents.add(index)
  })
  return [...presents].sort((a, b) => a - b)
}

// Grille du mois : 6 semaines × 7 cases, cases hors mois à null.
// Commence lundi (semaine ISO), complète à 42 cases pour une hauteur stable.
export const grilleMensuelle = (premier: Date): (Date | null)[][] => {
  const cases: (Date | null)[] = []
  const decalage = (premier.getDay() + 6) % 7
  for (let i = 0; i < decalage; i += 1) cases.push(null)
  const fin = new Date(premier.getFullYear(), premier.getMonth() + 1, 0).getDate()
  for (let jour = 1; jour <= fin; jour += 1) {
    cases.push(new Date(premier.getFullYear(), premier.getMonth(), jour))
  }
  while (cases.length % 7 !== 0) cases.push(null)
  while (cases.length < 42) cases.push(null)

  const semaines: (Date | null)[][] = []
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7))
  return semaines
}

// Libellé « Juin 2026 » pour l'entête de la carte calendrier.
export const libelleMoisTitre = (premier: Date): string =>
  premier.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })