import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const roleOptions = ['admin', 'prof', 'benevole-bibliotheque', 'parent'] as const

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
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
      type: 'select',
      defaultValue: 'prof',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Prof', value: 'prof' },
        { label: 'Bénévole bibliothèque', value: 'benevole-bibliotheque' },
        { label: 'Parent', value: 'parent' },
      ],
      required: true,
      saveToJWT: true,
    },
    {
      name: 'telephone',
      type: 'text',
    },
  ],
  timestamps: true,
}