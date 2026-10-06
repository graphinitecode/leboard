import {
  ajouterJoursCalendaires,
  ajouterMoisCalendaires,
  ecartJours,
  isoVersJour,
  jourSemaine,
  jourVersIso,
  type JourCalendaire,
} from '@/shared/fuseau'

export type FrequenceSerie = 'hebdomadaire' | 'mensuelle'

// Portée d'une modification ou d'une suppression dans une série
export type PorteeSerie = 'une' | 'suivantes' | 'toutes'

// Les séances d'une série sans fin existent toujours sur cet horizon glissant
// (le cron quotidien les prolonge)
export const HORIZON_MOIS = 3

export interface RegleSerie {
  frequence: FrequenceSerie
  // Première occurrence « YYYY-MM-DD »
  premiere: string
  // Dernier jour possible « YYYY-MM-DD », null = jamais
  fin: string | null
}

// Rang du jour de semaine dans le mois : 1 = premier … 4 = quatrième,
// 5 = dernier (un 29, 30 ou 31 est toujours le dernier de son mois)
export function rangDansMois(jour: JourCalendaire): number {
  return Math.ceil(jour.jour / 7)
}

// n-ième jour de semaine `js` (0 = lundi) du mois, ou le dernier si rang = 5
export function jourDuRang(annee: number, mois: number, js: number, rang: number): JourCalendaire {
  if (rang >= 5) {
    const dernier: JourCalendaire = { annee, jour: new Date(Date.UTC(annee, mois, 0)).getUTCDate(), mois }
    const recul = (jourSemaine(dernier) - js + 7) % 7
    return ajouterJoursCalendaires(dernier, -recul)
  }
  const premier: JourCalendaire = { annee, jour: 1, mois }
  const avance = (js - jourSemaine(premier) + 7) % 7
  return ajouterJoursCalendaires(premier, avance + (rang - 1) * 7)
}

// Libellé de la règle : « Chaque semaine le mardi », « Chaque mois le 2e mardi »
export function libelleRegle(frequence: FrequenceSerie, premiere: string): string {
  const jour = isoVersJour(premiere)
  const nom = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'][jourSemaine(jour)]
  if (frequence === 'hebdomadaire') return `Chaque semaine le ${nom}`
  const rang = rangDansMois(jour)
  return `Chaque mois le ${rang >= 5 ? 'dernier' : rang === 1 ? '1er' : `${rang}e`} ${nom}`
}

// Jours des occurrences de la règle compris entre `depuis` et `jusqua`
// (inclus), bornés par la première occurrence et la fin de la série
export function occurrences(regle: RegleSerie, depuis: string, jusqua: string): string[] {
  const premiere = isoVersJour(regle.premiere)
  const borneFin = regle.fin && regle.fin < jusqua ? regle.fin : jusqua
  const borneDebut = depuis > regle.premiere ? depuis : regle.premiere
  if (borneDebut > borneFin) return []

  const resultat: string[] = []
  if (regle.frequence === 'hebdomadaire') {
    // Saute directement à la première semaine utile
    const semaines = Math.max(0, Math.floor(ecartJours(premiere, isoVersJour(borneDebut)) / 7))
    for (let k = semaines; ; k++) {
      const iso = jourVersIso(ajouterJoursCalendaires(premiere, 7 * k))
      if (iso > borneFin) break
      if (iso >= borneDebut) resultat.push(iso)
    }
    return resultat
  }

  const js = jourSemaine(premiere)
  const rang = rangDansMois(premiere)
  for (let k = 0; ; k++) {
    const mois = ajouterMoisCalendaires({ ...premiere, jour: 1 }, k)
    const iso = jourVersIso(jourDuRang(mois.annee, mois.mois, js, rang))
    if (iso > borneFin) break
    if (iso >= borneDebut) resultat.push(iso)
  }
  return resultat
}

// Dernier jour à générer : la fin de la série, ou l'horizon glissant
export function limiteGeneration(aujourdhui: string, fin: string | null): string {
  const horizon = jourVersIso(ajouterMoisCalendaires(isoVersJour(aujourdhui), HORIZON_MOIS))
  return fin && fin < horizon ? fin : horizon
}

// Une série est « continue » sans date de fin (icône colorée), « bornée » sinon
export type EtatRecurrence = 'continue' | 'bornee'

export function etatRecurrence(fin: string | null | undefined): EtatRecurrence {
  return fin ? 'bornee' : 'continue'
}
