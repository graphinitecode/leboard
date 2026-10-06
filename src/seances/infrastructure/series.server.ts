import type { Payload, PayloadRequest } from 'payload'

import type { Seance, Series as Serie } from '@/payload-types'
import {
  ajouterJoursCalendaires,
  dateParis,
  ecartJours,
  heureDepuisMinutes,
  isoVersJour,
  jourParis,
  jourVersIso,
  minutesParis,
} from '@/shared/fuseau'
import { HEURE_DEBUT_COURS, HEURE_FIN_COURS, MESSAGE_FIN_COURS } from '@/shared/horaires'

import { limiteGeneration, occurrences, type PorteeSerie } from '../domain/recurrence'

// Erreur métier renvoyée telle quelle au client (statut 400)
export class ErreurSerie extends Error {}

const idDe = (valeur: number | { id: number } | null | undefined): number | undefined =>
  typeof valeur === 'object' && valeur !== null ? valeur.id : (valeur ?? undefined)

const aujourdhuiParis = () => jourVersIso(jourParis(new Date()))

// Crée les séances de la série après le dernier jour déjà généré, jusqu'à
// `jusqua`, puis avance `genereJusqua`
export async function genererOccurrencesSerie({
  payload,
  req,
  serie,
  jusqua,
}: {
  payload: Payload
  req?: PayloadRequest
  serie: Serie
  jusqua: string
}): Promise<number> {
  const depuis = serie.genereJusqua
    ? jourVersIso(ajouterJoursCalendaires(isoVersJour(serie.genereJusqua), 1))
    : serie.premiere
  const jours = occurrences(
    { fin: serie.fin ?? null, frequence: serie.frequence, premiere: serie.premiere },
    depuis,
    jusqua,
  )

  for (const jour of jours) {
    await payload.create({
      collection: 'seances',
      data: {
        date: dateParis(isoVersJour(jour), serie.heureDebut).toISOString(),
        duree: serie.duree,
        groupe: (serie.groupe ?? []).map((e) => idDe(e) as number),
        matiere: serie.matiere,
        prof: idDe(serie.prof) as number,
        serie: serie.id,
      },
      req,
    })
  }

  if (!serie.genereJusqua || jusqua > serie.genereJusqua) {
    await payload.update({ collection: 'series', data: { genereJusqua: jusqua }, id: serie.id, req })
  }
  return jours.length
}

// Cron quotidien : maintient l'horizon glissant des séries encore actives
export async function prolongerSeries(payload: Payload): Promise<number> {
  const aujourdhui = aujourdhuiParis()
  const { docs } = await payload.find({ collection: 'series', depth: 0, limit: 0, pagination: false })
  let creees = 0
  for (const serie of docs) {
    const jusqua = limiteGeneration(aujourdhui, serie.fin ?? null)
    if (serie.genereJusqua && serie.genereJusqua >= jusqua) continue
    creees += await genererOccurrencesSerie({ jusqua, payload, serie })
  }
  return creees
}

// Séances visées par une portée : celle-ci, celle-ci et les suivantes, ou
// toute la série — jamais les séances passées (historique des présences)
async function seancesVisees(payload: Payload, seance: Seance, portee: PorteeSerie): Promise<Seance[]> {
  const serieId = idDe(seance.serie as Serie | number | null)
  if (portee === 'une' || !serieId) return [seance]
  const depuis = portee === 'suivantes' ? seance.date : new Date().toISOString()
  const { docs } = await payload.find({
    collection: 'seances',
    depth: 0,
    limit: 0,
    pagination: false,
    where: { and: [{ serie: { equals: serieId } }, { date: { greater_than_equal: depuis } }] },
  })
  // La séance déplacée fait toujours partie du lot, même passée
  return docs.some((d) => d.id === seance.id) ? docs : [seance, ...docs]
}

// Déplace et/ou redimensionne selon la portée. Le décalage (jours et minutes,
// heure de Paris) de la séance d'origine s'applique à chaque séance visée ;
// au-delà de « cette séance », la règle de la série suit pour les séances à venir.
export async function modifierSeanceSerie({
  payload,
  seance,
  portee,
  date,
  duree,
}: {
  payload: Payload
  seance: Seance
  portee: PorteeSerie
  date: Date
  duree: number
}): Promise<number> {
  const decalageJours = ecartJours(jourParis(new Date(seance.date)), jourParis(date))
  const decalageMinutes = minutesParis(date) - minutesParis(new Date(seance.date))
  const visees = await seancesVisees(payload, seance, portee)

  const nouvelles = visees.map((s) => {
    const debut = minutesParis(new Date(s.date)) + decalageMinutes
    if (debut < HEURE_DEBUT_COURS * 60 || debut + duree > HEURE_FIN_COURS * 60) {
      throw new ErreurSerie(MESSAGE_FIN_COURS)
    }
    const jour = ajouterJoursCalendaires(jourParis(new Date(s.date)), decalageJours)
    return { date: dateParis(jour, heureDepuisMinutes(debut)).toISOString(), id: s.id }
  })

  for (const { id, date: nouvelleDate } of nouvelles) {
    await payload.update({ collection: 'seances', data: { date: nouvelleDate, duree }, id })
  }

  const serieId = idDe(seance.serie as Serie | number | null)
  if (portee !== 'une' && serieId) {
    const serie = await payload.findByID({ collection: 'series', depth: 0, id: serieId })
    const [h, m] = serie.heureDebut.split(':').map(Number)
    const decaler = (iso: string) => jourVersIso(ajouterJoursCalendaires(isoVersJour(iso), decalageJours))
    await payload.update({
      collection: 'series',
      data: {
        duree,
        heureDebut: heureDepuisMinutes(h * 60 + m + decalageMinutes),
        premiere: decaler(serie.premiere),
        // Les séances déjà générées ont bougé avec la règle : la génération
        // reprend après la dernière, sans doublon
        ...(serie.genereJusqua ? { genereJusqua: decaler(serie.genereJusqua) } : {}),
      },
      id: serieId,
    })
  }
  return nouvelles.length
}

// Supprime selon la portée. « Celle-ci et les suivantes » et « toute la
// série » arrêtent aussi la série (date de fin), qui n'est plus prolongée.
export async function supprimerSeanceSerie({
  payload,
  seance,
  portee,
}: {
  payload: Payload
  seance: Seance
  portee: PorteeSerie
}): Promise<number> {
  const visees = await seancesVisees(payload, seance, portee)
  const ids = visees.map((s) => s.id)

  await payload.delete({ collection: 'presences', where: { seance: { in: ids } } })
  await payload.delete({ collection: 'seances', where: { id: { in: ids } } })

  const serieId = idDe(seance.serie as Serie | number | null)
  if (portee !== 'une' && serieId) {
    const reference = portee === 'suivantes' ? jourParis(new Date(seance.date)) : jourParis(new Date())
    const veille = jourVersIso(ajouterJoursCalendaires(reference, -1))
    const serie = await payload.findByID({ collection: 'series', depth: 0, id: serieId })
    if (veille < serie.premiere) {
      // Aucune séance de la série ne reste : la série disparaît
      await payload.delete({ collection: 'series', id: serieId })
    } else if (!serie.fin || veille < serie.fin) {
      await payload.update({ collection: 'series', data: { fin: veille }, id: serieId })
    }
  }
  return ids.length
}

export const PORTEES: PorteeSerie[] = ['une', 'suivantes', 'toutes']
