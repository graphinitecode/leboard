import type { Payload } from 'payload'

import { FENETRE_SEANCES, RAPPEL_JOURS_AVANT, SEUIL_ABSENCES } from './alertsConfig'

function idDe(relation: unknown): number | string | undefined {
  if (relation == null) return undefined
  if (typeof relation === 'object' && 'id' in relation) return (relation as { id: number }).id
  return relation as number | string
}

function formatDate(date: unknown): string {
  return new Date(String(date)).toLocaleDateString('fr-FR')
}

// --- Décrochage ----------------------------------------------------------

export async function detecterDecrochage(payload: Payload): Promise<number> {
  const eleves = await payload.find({ collection: 'eleves', depth: 0, limit: 0 })
  const maintenant = new Date()
  let creees = 0

  for (const eleve of eleves.docs) {
    // Séances passées auxquelles l'élève était attendu (groupe), triées du plus récent
    const seancesAttendues = await payload.find({
      collection: 'seances',
      depth: 0,
      limit: FENETRE_SEANCES,
      sort: '-date',
      where: {
        and: [{ groupe: { equals: eleve.id } }, { date: { less_than: maintenant.toISOString() } }],
      },
    })

    if (seancesAttendues.docs.length === 0) continue

    // Présences de CES séances uniquement : les séries pré-créent les
    // présences des séances futures, qui sinon remplissent la fenêtre et
    // font compter les séances passées comme des absences.
    const presences = await payload.find({
      collection: 'presences',
      depth: 0,
      limit: 0,
      where: {
        and: [
          { eleve: { equals: eleve.id } },
          { seance: { in: seancesAttendues.docs.map((seance) => seance.id) } },
        ],
      },
    })

    const parSeance = new Map(
      presences.docs.map((p) => [String(idDe(p.seance)), p.present as string]),
    )

    const absences = seancesAttendues.docs.filter(
      (seance) => parSeance.get(String(seance.id)) !== 'present',
    ).length

    if (absences >= SEUIL_ABSENCES) {
      const existe = await payload.find({
        collection: 'alertes',
        depth: 0,
        limit: 1,
        where: {
          and: [
            { type: { equals: 'decrochage' } },
            { eleve: { equals: eleve.id } },
            { statut: { not_equals: 'traitee' } },
          ],
        },
      })

      if (existe.totalDocs > 0) continue

      await payload.create({
        collection: 'alertes',
        data: {
          dateCreation: maintenant.toISOString(),
          eleve: eleve.id,
          message: `${absences} absences sur les ${FENETRE_SEANCES} dernières séances`,
          statut: 'nouvelle',
          type: 'decrochage',
        },
        overrideAccess: true,
      })
      creees++
    } else {
      // Résolution douce : l'élève est de nouveau assidu
      const ouvertes = await payload.find({
        collection: 'alertes',
        depth: 0,
        limit: 0,
        where: {
          and: [
            { type: { equals: 'decrochage' } },
            { eleve: { equals: eleve.id } },
            { statut: { not_equals: 'traitee' } },
          ],
        },
      })

      for (const alerte of ouvertes.docs) {
        await payload.update({
          collection: 'alertes',
          id: alerte.id,
          data: {
            dateTraitement: maintenant.toISOString(),
            resolution: 'Résolue automatiquement (élève de nouveau assidu)',
            statut: 'traitee',
          },
          overrideAccess: true,
        })
      }
    }
  }

  return creees
}

// --- Retards bibliothèque ------------------------------------------------

export async function detecterRetardsBibliotheque(payload: Payload): Promise<number> {
  const maintenant = new Date()
  const prets = await payload.find({
    collection: 'prets',
    depth: 0,
    limit: 0,
    where: {
      and: [
        { dateRetourEffective: { equals: null } },
        { dateRetourPrevue: { less_than: maintenant.toISOString() } },
      ],
    },
  })

  let creees = 0
  for (const pret of prets.docs) {
    const existe = await payload.find({
      collection: 'alertes',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { type: { equals: 'retard-bibliotheque' } },
          { pret: { equals: pret.id } },
          { statut: { not_equals: 'traitee' } },
        ],
      },
    })

    if (existe.totalDocs > 0) continue

    await payload.create({
      collection: 'alertes',
      data: {
        dateCreation: maintenant.toISOString(),
        eleve: idDe(pret.eleve) as number,
        message: `Retard sur un exemplaire depuis le ${formatDate(pret.dateRetourPrevue)}`,
        pret: pret.id,
        statut: 'nouvelle',
        type: 'retard-bibliotheque',
      },
      overrideAccess: true,
    })
    creees++
  }

  return creees
}

// --- Rappels préventifs (échéance proche) ---------------------------------

export async function detecterRappelsPreventifs(payload: Payload): Promise<number> {
  const maintenant = new Date()
  const dansNJours = new Date()
  dansNJours.setDate(dansNJours.getDate() + RAPPEL_JOURS_AVANT)

  const prets = await payload.find({
    collection: 'prets',
    depth: 0,
    limit: 0,
    where: {
      and: [
        { dateRetourEffective: { equals: null } },
        { dateRetourPrevue: { less_than: dansNJours.toISOString() } },
      ],
    },
  })

  let creees = 0
  for (const pret of prets.docs) {
    // Déjà en retard → le détecteur des retards s'en occupe
    if (new Date(String(pret.dateRetourPrevue)) < maintenant) continue

    const existe = await payload.find({
      collection: 'alertes',
      depth: 0,
      limit: 1,
      where: {
        and: [
          { type: { equals: 'rappel-retour' } },
          { pret: { equals: pret.id } },
          { statut: { not_equals: 'traitee' } },
        ],
      },
    })

    if (existe.totalDocs > 0) continue

    await payload.create({
      collection: 'alertes',
      data: {
        dateCreation: maintenant.toISOString(),
        eleve: idDe(pret.eleve) as number,
        message: `Retour prévu le ${formatDate(pret.dateRetourPrevue)}`,
        pret: pret.id,
        statut: 'nouvelle',
        type: 'rappel-retour',
      },
      overrideAccess: true,
    })
    creees++
  }

  return creees
}

// --- Résolutions automatiques douces (prêts rendus) -----------------------

export async function resoudreAlertesPretsRendus(payload: Payload): Promise<number> {
  const maintenant = new Date()

  const pretsRendus = await payload.find({
    collection: 'prets',
    depth: 0,
    limit: 0,
    where: {
      dateRetourEffective: {
        not_equals: null,
      },
    },
  })

  let resolues = 0
  for (const pret of pretsRendus.docs) {
    const alertesOuvertes = await payload.find({
      collection: 'alertes',
      depth: 0,
      limit: 0,
      where: {
        and: [
          { pret: { equals: pret.id } },
          { statut: { not_equals: 'traitee' } },
          { type: { in: ['rappel-retour', 'retard-bibliotheque'] } },
        ],
      },
    })

    for (const alerte of alertesOuvertes.docs) {
      await payload.update({
        collection: 'alertes',
        id: alerte.id,
        data: {
          dateTraitement: maintenant.toISOString(),
          resolution: 'Résolue automatiquement (prêt rendu)',
          statut: 'traitee',
        },
        overrideAccess: true,
      })
      resolues++
    }
  }

  return resolues
}