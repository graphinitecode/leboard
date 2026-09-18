import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const jourOptions = [
  { label: 'Lundi', value: 'lundi' },
  { label: 'Mardi', value: 'mardi' },
  { label: 'Mercredi', value: 'mercredi' },
  { label: 'Jeudi', value: 'jeudi' },
  { label: 'Vendredi', value: 'vendredi' },
  { label: 'Samedi', value: 'samedi' },
]

export const Creneaux: CollectionConfig = {
  slug: 'creneaux',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['jour', 'heureDebut', 'heureFin', 'matiere', 'prof', 'actif'],
    useAsTitle: 'matiere',
  },
  fields: [
    {
      name: 'jour',
      options: jourOptions,
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
    {
      name: 'salle',
      type: 'text',
      admin: { position: 'sidebar' },
    },
    {
      name: 'matiere',
      options: [
        { label: 'Maths', value: 'maths' },
        { label: 'Français', value: 'francais' },
        { label: 'Anglais', value: 'anglais' },
        { label: 'Autre', value: 'autre' },
      ],
      required: true,
      type: 'select',
    },
    {
      name: 'prof',
      relationTo: 'users',
      type: 'relationship',
      filterOptions: {
        role: {
          in: ['admin', 'prof'],
        },
      },
    },
    {
      name: 'groupe',
      hasMany: true,
      relationTo: 'eleves',
      type: 'relationship',
    },
    {
      defaultValue: true,
      name: 'actif',
      type: 'checkbox',
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req }) => {
        // Un prof ne peut pas être sur 2 créneaux du même jour qui se chevauchent
        const profId = data?.prof
        if (!profId) return data

        const autres = await req.payload.find({
          collection: 'creneaux',
          depth: 0,
          limit: 0,
          where: {
            and: [
              { jour: { equals: data.jour } },
              { prof: { equals: profId } },
              ...(data.id ? [{ id: { not_equals: data.id } }] : []),
            ],
          },
        })

        const debut = minutes(data.heureDebut as string)
        const fin = minutes(data.heureFin as string)

        for (const autre of autres.docs) {
          const autreDebut = minutes(autre.heureDebut as string)
          const autreFin = minutes(autre.heureFin as string)
          if (debut < autreFin && fin > autreDebut) {
            throw new Error(
              'Conflit : ce prof est déjà affecté à un créneau qui se chevauche ce jour-là.',
            )
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}

function minutes(heure: string): number {
  const [h, m] = heure.split(':').map((part) => parseInt(part, 10))
  return (h || 0) * 60 + (m || 0)
}