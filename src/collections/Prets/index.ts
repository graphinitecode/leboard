import type { CollectionConfig } from 'payload'

import { biblioDelete, biblioRead, biblioWrite } from '../../access/biblio'
import { pretsBeforeChange } from '../../hooks/prets/pretsBeforeChange'

export const Prets: CollectionConfig = {
  slug: 'prets',
  access: {
    create: biblioWrite,
    delete: biblioDelete,
    read: biblioRead,
    update: biblioWrite,
  },
  admin: {
    defaultColumns: ['exemplaire', 'eleve', 'dateEmprunt', 'dateRetourPrevue', 'dateRetourEffective'],
    useAsTitle: 'exemplaire',
  },
  fields: [
    {
      name: 'exemplaire',
      relationTo: 'exemplaires',
      required: true,
      type: 'relationship',
      filterOptions: {
        etat: {
          not_equals: 'hs',
        },
      },
    },
    {
      name: 'eleve',
      relationTo: 'eleves',
      required: true,
      type: 'relationship',
    },
    {
      name: 'dateEmprunt',
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
        position: 'sidebar',
      },
    },
    {
      name: 'dateRetourPrevue',
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
        description: 'Défaut : +21 jours',
        position: 'sidebar',
      },
    },
    {
      name: 'dateRetourEffective',
      type: 'date',
      admin: {
        date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
        description: 'Renseigner pour clôturer le prêt',
        position: 'sidebar',
      },
    },
    {
      name: 'etatRetour',
      options: [
        { label: 'Bon', value: 'bon' },
        { label: 'Usé', value: 'use' },
        { label: 'Hors service', value: 'hs' },
      ],
      type: 'select',
      admin: {
        description: 'État constaté au retour (optionnel)',
        condition: (data) => Boolean(data?.dateRetourEffective),
      },
    },
    {
      name: 'commentaireRetour',
      type: 'text',
      admin: {
        condition: (data) => Boolean(data?.dateRetourEffective),
      },
    },
  ],
  hooks: {
    beforeChange: [pretsBeforeChange],
  },
  timestamps: true,
}