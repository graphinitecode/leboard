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
      name: 'profsDesSeances',
      type: 'relationship',
      hasMany: true,
      relationTo: 'users',
      admin: {
        description: 'Profs des séances auxquelles cet élève est inscrit (dénormalisé)',
        disabled: true,
        readOnly: true,
      },
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
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      name: 'consentementRGPD',
      type: 'checkbox',
      defaultValue: false,
      label: 'Consentement RGPD',
    },
    {
      access: {
        read: elevesChampSensible,
        update: elevesChampSensible,
      },
      name: 'consentementRetire',
      type: 'checkbox',
      defaultValue: false,
      label: 'Consentement retiré',
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
    {
      name: 'progressions',
      type: 'join',
      collection: 'progressions',
      on: 'eleve',
      admin: {
        allowCreate: true,
        defaultColumns: ['date', 'competence', 'niveau', 'commentaire'],
        description: 'Timeline des compétences travaillées',
      },
    },
    {
      name: 'presences',
      type: 'join',
      collection: 'presences',
      on: 'eleve',
      admin: {
        allowCreate: false,
        defaultColumns: ['seance', 'present', 'commentaire'],
        description: 'Historique des présences',
      },
    },
  ],
  hooks: {
    beforeValidate: [validerConsentement],
  },
  timestamps: true,
}