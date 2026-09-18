import type { CollectionConfig } from 'payload'

import { adminOnly } from '../../access/roles'

export const typeAlerteOptions = [
  { label: 'Décrochage', value: 'decrochage' },
  { label: 'Retard bibliothèque', value: 'retard-bibliotheque' },
  { label: 'Rappel retour', value: 'rappel-retour' },
  { label: 'RGPD — fin de rétention', value: 'rgpd-retention' },
]

export const statutAlerteOptions = [
  { label: 'Nouvelle', value: 'nouvelle' },
  { label: 'Vue', value: 'vue' },
  { label: 'Traitée', value: 'traitee' },
]

export const Alertes: CollectionConfig = {
  slug: 'alertes',
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    defaultColumns: ['dateCreation', 'type', 'eleve', 'message', 'statut'],
    description: 'Alertes générées par le cron nocturne (décrochage, retards, rétention RGPD)',
    useAsTitle: 'message',
  },
  fields: [
    {
      name: 'type',
      options: typeAlerteOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'eleve',
      relationTo: 'eleves',
      type: 'relationship',
    },
    // Champ `pret` (relation → prets) : à activer avec la Spec 04 (bibliothèque)
    // {
    //   name: 'pret',
    //   relationTo: 'prets',
    //   type: 'relationship',
    // },
    {
      name: 'message',
      required: true,
      type: 'text',
    },
    {
      defaultValue: 'nouvelle',
      name: 'statut',
      options: statutAlerteOptions,
      required: true,
      type: 'select',
    },
    {
      name: 'dateCreation',
      defaultValue: () => new Date().toISOString(),
      required: true,
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy HH:mm', pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'dateTraitement',
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy HH:mm', pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'resolution',
      type: 'textarea',
      admin: {
        description: 'Action réalisée (ex. parent appelé, profil anonymisé)',
      },
    },
  ],
  timestamps: true,
}