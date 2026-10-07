import type { CollectionConfig } from 'payload'

import {
  presencesDelete,
  presencesRead,
  presencesWrite,
} from '../../access/presences'
import { preCreerPresencesSeance } from '../../hooks/preCreerPresencesSeance'
import { verifierUnicitePresence } from '../../hooks/verifierUnicitePresence'

export const Presences: CollectionConfig = {
  slug: 'presences',
  access: {
    create: presencesWrite,
    delete: presencesDelete,
    read: presencesRead,
    update: presencesWrite,
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
        const { data, originalDoc, req } = args
        if (!data?.eleve || !data?.seance) return data
        // En mise à jour, Payload complète `data` avec eleve/seance du
        // document : sans son id, la vérification trouverait la présence
        // elle-même et bloquerait tout changement de statut.
        const result = await verifierUnicitePresence({ data, id: originalDoc?.id, req })
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