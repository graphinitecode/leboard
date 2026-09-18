import type { CollectionConfig } from 'payload'

import { biblioDelete, biblioRead, biblioWrite } from '../../access/biblio'

export const etatExemplaireOptions = [
  { label: 'Neuf', value: 'neuf' },
  { label: 'Bon', value: 'bon' },
  { label: 'Usé', value: 'use' },
  { label: 'Hors service', value: 'hs' },
]

const PREFIXE_CODE = 'LPV-'

export const Exemplaires: CollectionConfig = {
  slug: 'exemplaires',
  access: {
    create: biblioWrite,
    delete: biblioDelete,
    read: biblioRead,
    update: biblioWrite,
  },
  admin: {
    defaultColumns: ['code', 'livre', 'etat', 'commentaire'],
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'livre',
      relationTo: 'livres',
      required: true,
      type: 'relationship',
    },
    {
      name: 'code',
      type: 'text',
      unique: true,
      admin: {
        description: 'Laisser vide pour générer automatiquement (ex. LPV-0001)',
        position: 'sidebar',
      },
    },
    {
      name: 'etat',
      defaultValue: 'neuf',
      options: etatExemplaireOptions,
      type: 'select',
    },
    {
      name: 'commentaire',
      type: 'text',
      admin: {
        description: 'État constaté, notes d’entretien',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        if (data?.code) return data

        // Génère le prochain code unique (LPV-0001, LPV-0002, …)
        const dernieres = await req.payload.find({
          collection: 'exemplaires',
          depth: 0,
          limit: 1,
          sort: '-createdAt',
          where: {
            code: {
              like: PREFIXE_CODE,
            },
          },
        })

        const dernierCode = dernieres.docs[0]?.code as string | undefined
        const dernierNumero = dernierCode ? parseInt(dernierCode.replace(PREFIXE_CODE, ''), 10) : 0
        const prochain = Number.isNaN(dernierNumero) ? 0 : dernierNumero

        data.code = `${PREFIXE_CODE}${String(prochain + 1).padStart(4, '0')}`
        return data
      },
    ],
  },
  timestamps: true,
}