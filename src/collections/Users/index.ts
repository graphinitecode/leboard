import type { CollectionConfig } from 'payload'

import { usersAdmin, usersCreate, usersDelete, usersRead, usersUpdate } from '../../access/users'
import { denormaliserNomComplet } from '../../hooks/denormaliserNomComplet'

export const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Prof', value: 'prof' },
  { label: 'Bénévole bibliothèque', value: 'benevole-bibliotheque' },
  { label: 'Parent', value: 'parent' },
]

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: usersAdmin,
    create: usersCreate,
    delete: usersDelete,
    read: usersRead,
    update: usersUpdate,
  },
  admin: {
    defaultColumns: ['prenom', 'nom', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'prenom',
      type: 'text',
      label: 'Prénom',
      required: true,
    },
    {
      name: 'nom',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Construit automatiquement : prénom + nom (lecture seule)',
        readOnly: true,
      },
      hidden: true,
      label: 'Nom complet',
    },
    {
      name: 'role',
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      defaultValue: 'prof',
      label: 'Rôle',
      options: roleOptions,
      required: true,
      saveToJWT: true,
      type: 'select',
    },
    {
      name: 'telephone',
      type: 'text',
      label: 'Téléphone',
    },
    {
      name: 'disponibilites',
      type: 'array',
      label: 'Disponibilités',
      admin: {
        condition: (data) => data?.role === undefined || data?.role === 'prof',
        description: 'Créneaux hebdomadaires de disponibilité (pour le planning)',
      },
      fields: [
        {
          name: 'jour',
          label: 'Jour',
          options: [
            { label: 'Lundi', value: 'lundi' },
            { label: 'Mardi', value: 'mardi' },
            { label: 'Mercredi', value: 'mercredi' },
            { label: 'Jeudi', value: 'jeudi' },
            { label: 'Vendredi', value: 'vendredi' },
            { label: 'Samedi', value: 'samedi' },
          ],
          required: true,
          type: 'select',
        },
        {
          name: 'heureDebut',
          label: 'Heure de début',
          required: true,
          type: 'text',
          admin: { description: 'Format HH:mm (ex. 17:30)' },
        },
        {
          name: 'heureFin',
          label: 'Heure de fin',
          required: true,
          type: 'text',
          admin: { description: 'Format HH:mm (ex. 19:00)' },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [denormaliserNomComplet],
  },
  timestamps: true,
}