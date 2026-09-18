import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { preCreerPresencesSeance } from '../../hooks/preCreerPresencesSeance'
import { verifierUnicitePresence } from '../../hooks/verifierUnicitePresence'

export const Presences: CollectionConfig = {
  slug: 'presences',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['seance', 'eleve', 'present'],
    useAsTitle: 'eleve',
  },
  fields: [
    {
      name: 'seance',
      relationTo: 'seances',
      type: 'relationship',
      required: true,
    },
    {
      name: 'eleve',
      relationTo: 'eleves',
      type: 'relationship',
      required: true,
    },
    {
      name: 'present',
      label: 'Statut',
      options: [
        { label: 'Présent', value: 'present' },
        { label: 'Absent', value: 'absent' },
        { label: 'Absent (justifié)', value: 'absent-justifie' },
      ],
      type: 'select',
      defaultValue: 'present',
      required: true,
    },
    {
      name: 'commentaire',
      type: 'text',
      admin: {
        description: 'Motif factuel uniquement (ex. maladie), pas de détail médical.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async (args) => {
        const { data, req } = args
        if (!data?.eleve || !data?.seance) return data
        const result = await verifierUnicitePresence({ data, req })
        if (result !== true) {
          throw new Error(result)
        }
        return data
      },
    ],
  },
  timestamps: true,
}

export { preCreerPresencesSeance }