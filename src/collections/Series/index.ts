import type { CollectionAfterChangeHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { seancesCreate, seancesDelete, seancesRead, seancesWrite } from '../../access/seances'
import { genererOccurrencesSerie } from '../../seances/infrastructure/series.server'
import { limiteGeneration } from '../../seances/domain/recurrence'
import { HEURE_FIN_COURS, MESSAGE_FIN_COURS } from '../../shared/horaires'
import { jourParis, jourVersIso } from '../../shared/fuseau'
import { matiereOptions } from '../Seances'

const FORMAT_JOUR = /^\d{4}-\d{2}-\d{2}$/
const FORMAT_HEURE = /^\d{2}:\d{2}$/

// Un prof ne crée une série que pour lui-même ; la séance doit finir à 18h
const avantEnregistrement: CollectionBeforeChangeHook = ({ data, operation, originalDoc, req }) => {
  if (operation === 'create' && req.user?.role === 'prof') data.prof = req.user.id
  // En mise à jour, `data` peut ne porter que les champs modifiés
  const serie = { ...originalDoc, ...data }
  const [h, m] = String(serie.heureDebut ?? '').split(':').map(Number)
  if (h * 60 + m + Number(serie.duree ?? 0) > HEURE_FIN_COURS * 60) {
    throw new Error(MESSAGE_FIN_COURS)
  }
  if (serie.fin && serie.premiere && serie.fin < serie.premiere) {
    throw new Error('La date de fin doit suivre la première séance.')
  }
  return data
}

// Création : génère les séances jusqu'à la fin, ou sur l'horizon glissant
const genererALaCreation: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const aujourdhui = jourVersIso(jourParis(new Date()))
  await genererOccurrencesSerie({
    jusqua: limiteGeneration(aujourdhui, doc.fin ?? null),
    payload: req.payload,
    req,
    serie: doc,
  })
  return doc
}

// Règle de répétition d'une séance : les occurrences sont de vraies séances
// (appel et présences par séance), rattachées à la série par `serie`.
export const Series: CollectionConfig = {
  slug: 'series',
  access: {
    create: seancesCreate,
    delete: seancesDelete,
    read: seancesRead,
    update: seancesWrite,
  },
  admin: {
    defaultColumns: ['matiere', 'frequence', 'premiere', 'fin', 'prof'],
    group: 'Séances',
    useAsTitle: 'premiere',
  },
  fields: [
    {
      name: 'frequence',
      label: 'Fréquence',
      options: [
        { label: 'Chaque semaine', value: 'hebdomadaire' },
        { label: 'Chaque mois (même jour de semaine)', value: 'mensuelle' },
      ],
      required: true,
      type: 'select',
    },
    {
      name: 'premiere',
      admin: { description: 'Première séance (AAAA-MM-JJ)' },
      label: 'Première séance',
      required: true,
      type: 'text',
      validate: (valeur: null | string | undefined) =>
        FORMAT_JOUR.test(valeur ?? '') || 'Date attendue au format AAAA-MM-JJ.',
    },
    {
      name: 'fin',
      admin: { description: 'Dernier jour possible (AAAA-MM-JJ) ; vide = jamais' },
      label: 'Fin',
      type: 'text',
      validate: (valeur: null | string | undefined) =>
        !valeur || FORMAT_JOUR.test(valeur) || 'Date attendue au format AAAA-MM-JJ.',
    },
    {
      name: 'heureDebut',
      label: 'Heure de début',
      required: true,
      type: 'text',
      validate: (valeur: null | string | undefined) =>
        FORMAT_HEURE.test(valeur ?? '') || 'Heure attendue au format HH:mm.',
    },
    {
      name: 'duree',
      label: 'Durée (min)',
      min: 30,
      required: true,
      type: 'number',
    },
    {
      name: 'matiere',
      options: matiereOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'groupe',
      hasMany: true,
      relationTo: 'eleves',
      type: 'relationship',
    },
    {
      name: 'prof',
      relationTo: 'users',
      required: true,
      type: 'relationship',
    },
    {
      name: 'genereJusqua',
      admin: {
        description: 'Dernier jour déjà généré (prolongé par le cron quotidien)',
        readOnly: true,
      },
      label: 'Générée jusqu’au',
      type: 'text',
    },
  ],
  hooks: {
    afterChange: [genererALaCreation],
    beforeChange: [avantEnregistrement],
  },
  timestamps: true,
}
