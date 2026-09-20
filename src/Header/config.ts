import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'afficherRecherche',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afficher le bouton de recherche',
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'typeItem',
          type: 'radio',
          admin: {
            layout: 'horizontal',
          },
          defaultValue: 'lien',
          label: 'Type d’élément',
          options: [
            { label: 'Lien simple', value: 'lien' },
            { label: 'Menu déroulant', value: 'dropdown' },
          ],
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, siblingData) => siblingData?.typeItem !== 'dropdown',
            },
          },
        }),
        {
          name: 'dropdown',
          type: 'group',
          admin: {
            condition: (_, siblingData) => siblingData?.typeItem === 'dropdown',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Libellé du menu',
              required: true,
            },
            {
              name: 'sousLiens',
              type: 'array',
              fields: [link({ appearances: false })],
              label: 'Sous-liens',
              maxRows: 8,
            },
          ],
          label: 'Menu déroulant',
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}