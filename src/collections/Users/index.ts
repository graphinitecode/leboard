import type { CollectionConfig } from 'payload'

import { usersAdmin, usersCreate, usersDelete, usersRead, usersUpdate } from '../../access/users'

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
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      defaultValue: 'prof',
      options: roleOptions,
      required: true,
      saveToJWT: true,
      type: 'select',
    },
    {
      name: 'telephone',
      type: 'text',
    },
    {
      name: 'disponibilites',
      type: 'array',
      admin: {
        condition: (data) => data?.role === undefined || data?.role === 'prof',
        description: 'Créneaux hebdomadaires de disponibilité (pour le planning)',
      },
      fields: [
        {
          name: 'jour',
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
          required: true,
          type: 'text',
          admin: { description: 'Format HH:mm (ex. 17:30)' },
        },
        {
          name: 'heureFin',
          required: true,
          type: 'text',
          admin: { description: 'Format HH:mm (ex. 19:00)' },
        },
      ],
    },
  ],
  timestamps: true,
}