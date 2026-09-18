import type { GlobalConfig } from 'payload'

import { VERSION_POLITIQUE } from '../../utilities/rgpdConfig'

export const PolitiqueRgpd: GlobalConfig = {
  slug: 'politique-rgpd',
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    description: 'Politique de protection des données, affichée publiquement sur /rgpd',
  },
  fields: [
    {
      name: 'version',
      defaultValue: VERSION_POLITIQUE,
      type: 'text',
      admin: {
        description: 'Ex. v1 — référencée par les consentements des élèves',
      },
      required: true,
    },
    {
      name: 'datePublication',
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
      name: 'contenu',
      type: 'richText',
      required: true,
    },
  ],
  label: 'Politique RGPD',
}