/* Heure de Paris, indépendante du fuseau de la machine : le serveur (UTC sur
   Vercel) génère les séances récurrentes, et 14h doit rester 14h de part et
   d'autre d'un changement d'heure. */
export const FUSEAU_COURS = 'Europe/Paris'

// Jour du calendrier, sans heure ni fuseau (mois de 1 à 12)
export interface JourCalendaire {
  annee: number
  mois: number
  jour: number
}

const formatParis = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  timeZone: FUSEAU_COURS,
  year: 'numeric',
})

function partiesParis(instant: Date): JourCalendaire & { minutes: number } {
  const parties = formatParis.formatToParts(instant)
  const valeur = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parties.find((p) => p.type === type)?.value)
  return {
    annee: valeur('year'),
    jour: valeur('day'),
    minutes: valeur('hour') * 60 + valeur('minute'),
    mois: valeur('month'),
  }
}

// Écart (en minutes) entre l'heure de Paris et UTC à cet instant
function decalageParis(instant: number): number {
  const p = partiesParis(new Date(instant))
  const commeUtc = Date.UTC(p.annee, p.mois - 1, p.jour, Math.floor(p.minutes / 60), p.minutes % 60)
  return (commeUtc - Math.floor(instant / 60_000) * 60_000) / 60_000
}

// Instant correspondant à un jour et une heure « HH:mm » à Paris
export function dateParis(jour: JourCalendaire, heure: string): Date {
  const [h, m] = heure.split(':').map(Number)
  const naif = Date.UTC(jour.annee, jour.mois - 1, jour.jour, h, m)
  let instant = naif - decalageParis(naif) * 60_000
  // Second passage : le décalage peut changer entre l'estimation et l'instant réel
  const corrige = naif - decalageParis(instant) * 60_000
  if (corrige !== instant) instant = corrige
  return new Date(instant)
}

// Jour du calendrier à Paris pour un instant
export function jourParis(instant: Date): JourCalendaire {
  const { annee, mois, jour } = partiesParis(instant)
  return { annee, jour, mois }
}

// Minutes écoulées depuis minuit à Paris pour un instant
export function minutesParis(instant: Date): number {
  return partiesParis(instant).minutes
}

// « HH:mm » depuis un nombre de minutes depuis minuit
export function heureDepuisMinutes(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

// « YYYY-MM-DD » ⇄ jour du calendrier
export function jourVersIso(jour: JourCalendaire): string {
  return `${jour.annee}-${String(jour.mois).padStart(2, '0')}-${String(jour.jour).padStart(2, '0')}`
}

export function isoVersJour(iso: string): JourCalendaire {
  const [annee, mois, jour] = iso.slice(0, 10).split('-').map(Number)
  return { annee, jour, mois }
}

// Arithmétique de jours sur le calendrier (pas d'heure, pas de fuseau)
export function ajouterJoursCalendaires(jour: JourCalendaire, n: number): JourCalendaire {
  const d = new Date(Date.UTC(jour.annee, jour.mois - 1, jour.jour + n))
  return { annee: d.getUTCFullYear(), jour: d.getUTCDate(), mois: d.getUTCMonth() + 1 }
}

export function ajouterMoisCalendaires(jour: JourCalendaire, n: number): JourCalendaire {
  const d = new Date(Date.UTC(jour.annee, jour.mois - 1 + n, 1))
  const dernier = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  return { annee: d.getUTCFullYear(), jour: Math.min(jour.jour, dernier), mois: d.getUTCMonth() + 1 }
}

// Écart en jours entre deux jours du calendrier (b − a)
export function ecartJours(a: JourCalendaire, b: JourCalendaire): number {
  return (Date.UTC(b.annee, b.mois - 1, b.jour) - Date.UTC(a.annee, a.mois - 1, a.jour)) / 86_400_000
}

// 0 = lundi … 6 = dimanche
export function jourSemaine(jour: JourCalendaire): number {
  return (new Date(Date.UTC(jour.annee, jour.mois - 1, jour.jour)).getUTCDay() + 6) % 7
}
