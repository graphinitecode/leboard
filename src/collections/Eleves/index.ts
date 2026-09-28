import type { CollectionConfig } from 'payload'

import { elevesChampSensible, elevesRead, elevesWrite } from '../../access/eleves'
import { validerConsentement } from '../../hooks/validerConsentement'
import { VERSION_POLITIQUE } from '../../utilities/rgpdConfig'

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
    create: elevesWrite,
    delete: elevesWrite,
    read: elevesRead,
    update: elevesWrite,
  },
  admin: {
    defaultColumns: ['nom', 'prenom', 'niveau', 'groupe', 'profReferent'],
    useAsTitle: 'nom',
  },
  fields: [
    {
      label: 'Prénom',
      name: 'prenom',
      type: 'text',
      required: true,
    },
    {
      label: 'Nom',
      name: 'nom',
      type: 'text',
      required: true,
    },
    {
      label: 'Date de naissance',
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
      label: 'Niveau',
      name: 'niveau',
      type: 'select',
      options: niveauOptions,
      required: true,
    },
    {
      label: 'Groupe',
      name: 'groupe',
      type: 'text',
    },
    {
      label: 'Prof référent',
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
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      admin: {
        description:
          'Créer d’abord le compte du parent (collection Users, rôle « Parent »), puis le relier ici. Obligatoire pour un élève mineur.',
      },
      hasMany: true,
      label: 'Parents',
      name: 'parents',
      relationTo: 'users',
      type: 'relationship',
      filterOptions: {
        role: {
          equals: 'parent',
        },
      },
    },
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      defaultValue: false,
      label: 'Consentement RGPD',
      name: 'consentementRGPD',
      type: 'checkbox',
      admin: {
        description:
          'Le consentement parental est obligatoire pour créer un élève mineur ; un majeur consent lui-même.',
      },
    },
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      defaultValue: false,
      label: 'Consentement retiré',
      name: 'consentementRetire',
      type: 'checkbox',
      admin: {
        description: 'Cocher si la famille retire son consentement (déclenche l’anonymisation)',
      },
    },
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
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
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      name: 'versionConsentement',
      type: 'text',
      admin: {
        description: 'Version de la politique acceptée',
        readOnly: true,
      },
      defaultValue: VERSION_POLITIQUE,
      label: 'Version du consentement',
    },
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      name: 'dateFinAdhesion',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy',
          pickerAppearance: 'dayOnly',
        },
        description: 'Renseigner quand l’élève quitte l’association (déclenche la rétention)',
      },
      label: 'Fin d’adhésion',
    },
  ],
  hooks: {
    beforeValidate: [validerConsentement],
  },
  timestamps: true,
}