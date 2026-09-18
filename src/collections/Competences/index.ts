import type { CollectionConfig } from 'payload'

import { competencesRead, competencesWrite } from '../../access/competences'
import { matiereOptions } from '../Seances'

export const Competences: CollectionConfig = {
  slug: 'competences',
  access: {
    create: competencesWrite,
    delete: competencesWrite,
    read: competencesRead,
    update: competencesWrite,
  },
  admin: {
    defaultColumns: ['label', 'matiere', 'cycle'],
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'label',
      required: true,
      type: 'text',
    },
    {
      name: 'matiere',
      options: matiereOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'cycle',
      options: [
        { label: 'Cycle 2 (CP-CE2)', value: 'cycle-2' },
        { label: 'Cycle 3 (CM1-6e)', value: 'cycle-3' },
        { label: 'Cycle 4 (5e-3e)', value: 'cycle-4' },
        { label: 'Lycée', value: 'lycee' },
      ],
      type: 'select',
    },
  ],
  timestamps: true,
}