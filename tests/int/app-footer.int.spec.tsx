import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppFooter } from '@/components/molecules/m-app-footer'

describe('AppFooter', () => {
  it('rend le copyright, le retour au site et la politique de données par défaut', () => {
    render(<AppFooter data={null} />)

    expect(screen.getByText(/Association Les Pierres Vivantes/)).toBeDefined()
    expect(screen.getByRole('link', { name: /Site de l.association/ }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Protection des données' }).getAttribute('href')).toBe('/rgpd')
  })
})
