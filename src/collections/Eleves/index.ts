import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const niveauOptions = [
  { label: 'CP', value: 'CP' },
  { label: 'CE1', value: 'CE1' },
  { label: 'CE2', value: 'CE2' },
  { label: 'CM1', value: 'CM1' },
  { label: 'CM2', value: 'CM2' },
  { label: '6e', value: '6e' },
  { label: '5e', value: '5e' },
  { label: '4e', value: '4e' },
  { label: '3e', value: '3e' },
  { label: '2nde', value: '2nde' },
  { label: '1ère', value: '1ere' },
  { label: 'Terminale', value: 'Terminale' },
]

export const Eleves: CollectionConfig = {
  slug: 'eleves',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['nom', 'prenom', 'niveau', 'groupe', 'profReferent'],
    useAsTitle: 'nom',
  },
  fields: [
    {
      name: 'prenom',
      type: 'text',
      required: true,
    },
    {
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      name: 'dateNaissance',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy',
          pickerAppearance: 'dayOnly',
        },
      },
      required: true,
    },
    {
      name: 'niveau',
      type: 'select',
      options: niveauOptions,
      required: true,
    },
    {
      name: 'groupe',
      type: 'text',
    },
    {
      name: 'profReferent',
      relationTo: 'users',
      type: 'relationship',
      filterOptions: {
        role: {
          in: ['admin', 'prof'],
        },
      },
    },
    {
      name: 'parents',
      hasMany: true,
      relationTo: 'users',
      type: 'relationship',
      filterOptions: {
        role: {
          equals: 'parent',
        },
      },
    },
    {
      name: 'consentementRGPD',
      type: 'checkbox',
      defaultValue: false,
      label: 'Consentement RGPD',
    },
    {
      name: 'dateConsentement',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy',
          pickerAppearance: 'dayOnly',
        },
      },
      label: 'Date du consentement',
    },
  ],
  timestamps: true,
}