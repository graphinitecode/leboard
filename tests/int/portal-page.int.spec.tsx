import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PortalPage } from '@/components/templates/t-portal-page'

describe('PortalPage', () => {
  it('rend le shell avec la couleur du portail par défaut', () => {
    const { container } = render(
      <PortalPage>
        <p>Contenu</p>
      </PortalPage>,
    )
    const shell = container.querySelector('.lpv-shell')
    expect(shell).not.toBeNull()
    expect(shell?.getAttribute('data-lpv-portail')).toBe('profs')
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('porte la couleur du portail demande', () => {
    const { container } = render(
      <PortalPage portail="parents">
        <p>Contenu</p>
      </PortalPage>,
    )
    expect(container.querySelector('.lpv-shell')?.getAttribute('data-lpv-portail')).toBe('parents')
  })

  it('rend le skip link et la cible du contenu principal', () => {
    const { container } = render(
      <PortalPage>
        <p>Contenu</p>
      </PortalPage>,
    )
    const skip = container.querySelector('.lpv-skip-link')
    expect(skip).not.toBeNull()
    expect(skip?.getAttribute('href')).toBe('#contenu-principal')
    expect(container.querySelector('main#contenu-principal')).not.toBeNull()
  })

  it('rend le header en slot et les liens du footer', () => {
    const { container } = render(
      <PortalPage
        footerLinks={[{ href: '/profs/login', label: 'Connexion' }]}
        header={<div>Entête</div>}
      >
        <p>Contenu</p>
      </PortalPage>,
    )
    expect(screen.getByText('Entête')).toBeDefined()
    expect(screen.getByText('Connexion')).toBeDefined()
    expect(container.querySelector('.lpv-t-portal-page')).not.toBeNull()
  })
})