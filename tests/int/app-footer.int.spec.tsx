import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppFooter } from '@/components/molecules/m-app-footer'
import { toAppFooterData } from '@/utilities/appFooter'

describe('AppFooter', () => {
  it('rend le copyright, le retour au site et la politique de données par défaut', () => {
    render(<AppFooter {...toAppFooterData(null)} />)

    expect(screen.getByText(/Association Les Pierres Vivantes/)).toBeDefined()
    expect(screen.getByRole('link', { name: /Site de l.association/ }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Protection des données' }).getAttribute('href')).toBe('/rgpd')
  })

  it('reprend les liens légaux du global (page référencée ou URL)', () => {
    const data = toAppFooterData({
      copyright: 'LPV',
      id: 1,
      navItems: [
        { id: 'a', link: { label: 'Mentions légales', reference: { relationTo: 'pages', value: { slug: 'mentions-legales' } }, type: 'reference' } },
        { id: 'b', link: { label: 'Charte', type: 'custom', url: 'https://exemple.fr/charte' } },
      ],
    } as never)

    expect(data.links.map((l) => [l.label, l.href])).toEqual([
      ['Site de l’association', '/'],
      ['Mentions légales', '/mentions-legales'],
      ['Charte', 'https://exemple.fr/charte'],
    ])
  })
})
