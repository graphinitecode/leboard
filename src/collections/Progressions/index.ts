import type { CollectionConfig } from 'payload'

import { progressionsDelete, progressionsRead, progressionsWrite } from '../../access/progressions'
import { denormaliserProgression } from '../../hooks/denormaliserProgression'
import { matiereOptions } from '../Seances'

export const niveauProgressionOptions = [
  { label: 'Acquis', value: 'acquis' },
  { label: 'En cours', value: 'en-cours' },
  { label: 'À revoir', value: 'a-revoir' },
]

export const Progressions: CollectionConfig = {
  slug: 'progressions',
  access: {
    create: progressionsWrite,
    delete: progressionsDelete,
    read: progressionsRead,
    update: progressionsWrite,
  },
  admin: {
    defaultColumns: ['eleve', 'date', 'competence', 'niveau'],
    useAsTitle: 'competence',
  },
  fields: [
    {
      name: 'eleve',
      relationTo: 'eleves',
      required: true,
      type: 'relationship',
    },
    {
      name: 'competence',
      relationTo: 'competences',
      required: true,
      type: 'relationship',
    },
    {
      name: 'matiere',
      type: 'select',
      admin: {
        description: 'Copiée depuis la compétence (lecture seule)',
        readOnly: true,
        position: 'sidebar',
      },
      options: matiereOptions,
    },
    {
      name: 'niveau',
      options: niveauProgressionOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
        position: 'sidebar',
      },
    },
    {
      name: 'seance',
      relationTo: 'seances',
      type: 'relationship',
      admin: {
        description: 'Optionnel — lier à la séance d’origine',
      },
    },
    {
      name: 'commentaire',
      type: 'textarea',
      admin: {
        description: 'Observation courte, visible par la famille (portail)',
      },
    },
  ],
  hooks: {
    beforeChange: [denormaliserProgression],
  },
  timestamps: true,
}