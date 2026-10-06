import type { CollectionConfig } from 'payload'

import { seancesCreate, seancesDelete, seancesRead, seancesWrite } from '../../access/seances'
import { preCreerPresencesSeance } from '../../hooks/preCreerPresencesSeance'
import { modifierSerieEndpoint, supprimerSerieEndpoint } from '../../seances/infrastructure/series.endpoints'

export const matiereOptions = [
  { label: 'Maths', value: 'maths' },
  { label: 'Français', value: 'francais' },
  { label: 'Anglais', value: 'anglais' },
  { label: 'Autre', value: 'autre' },
]

export const Seances: CollectionConfig = {
  slug: 'seances',
  access: {
    create: seancesCreate,
    delete: seancesDelete,
    read: seancesRead,
    update: seancesWrite,
  },
  admin: {
    defaultColumns: ['date', 'matiere', 'prof', 'groupe'],
    useAsTitle: 'date',
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm',
          pickerAppearance: 'dayAndTime',
        },
      },
      required: true,
    },
    {
      name: 'matiere',
      type: 'select',
      options: matiereOptions,
      required: true,
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
      type: 'relationship',
      filterOptions: {
        role: {
          in: ['admin', 'prof'],
        },
      },
      required: true,
    },
    {
      name: 'duree',
      type: 'number',
      admin: {
        description: 'Durée en minutes',
        step: 15,
      },
      label: 'Durée (min)',
    },
    {
      name: 'retour',
      type: 'richText',
      label: 'Retour du prof',
    },
    {
      name: 'serie',
      admin: {
        description: 'Série dont cette séance est une occurrence (vide = séance ponctuelle)',
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Série',
      relationTo: 'series',
      type: 'relationship',
    },
  ],
  endpoints: [modifierSerieEndpoint, supprimerSerieEndpoint],
  hooks: {
    afterChange: [preCreerPresencesSeance],
  },
  timestamps: true,
}