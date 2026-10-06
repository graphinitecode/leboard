import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pied de page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      label: 'Accroche',
      admin: {
        description: 'Court texte affiché sous le logo.',
      },
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Colonnes de liens',
      maxRows: 3,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#ColumnRowLabel',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Titre de la colonne',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          label: 'Liens',
          maxRows: 8,
          fields: [link({ appearances: false })],
        },
      ],
    },
    {
      name: 'adminLink',
      type: 'group',
      label: 'Lien vers l’administration',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'show',
              type: 'checkbox',
              defaultValue: true,
              label: 'Afficher le lien',
              admin: {
                style: { alignSelf: 'flex-end' },
                width: '50%',
              },
            },
            {
              name: 'label',
              type: 'text',
              defaultValue: 'Espace administration',
              label: 'Libellé',
              admin: {
                condition: (_, siblingData) => Boolean(siblingData?.show),
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'copyright',
      type: 'text',
      defaultValue: 'Association Les Pierres Vivantes',
      label: 'Mention de copyright',
      admin: {
        description: 'Affiché sous la forme « © <année> <mention>. Tous droits réservés. »',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      label: 'Liens du bas de page',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        description: 'Liens discrets à côté du copyright (mentions légales, RGPD…).',
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
