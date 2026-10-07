import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppShell } from '@/components/templates/t-app-shell'
import { getShellNav } from '@/utilities/portalNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/profs',
}))

vi.mock('@/components/molecules/m-logout', () => ({
  logout: vi.fn(),
}))

const connected = getShellNav('profs', {
  email: 'prof@lpv.fr',
  nom: 'Curie',
  prenom: 'Marie',
  role: 'prof',
})

describe('AppShell', () => {
  it('rend le skip link, la cible du contenu principal et la couleur du portail', () => {
    const { container } = render(
      <AppShell homeHref="/parents" portail="parents">
        <p>Contenu</p>
      </AppShell>,
    )
    const shell = container.querySelector('.lpv-shell')
    expect(shell?.getAttribute('data-lpv-portail')).toBe('parents')
    expect(container.querySelector('.lpv-skip-link')?.getAttribute('href')).toBe('#contenu-principal')
    expect(container.querySelector('main#contenu-principal')?.textContent).toBe('Contenu')
  })

  it('déconnecté : logo seul, ni sidebar ni barre d’onglets', () => {
    const { container } = render(
      <AppShell footer={{ copyright: 'LPV', links: [{ href: '/rgpd', label: 'Pied' }] }} homeHref="/profs">
        <p>Contenu</p>
      </AppShell>,
    )
    expect(screen.queryByRole('navigation', { name: 'Navigation principale' })).toBeNull()
    expect(container.querySelector('.lpv-t-app-shell--connected')).toBeNull()
    expect(screen.getByRole('link', { name: /accueil/ }).getAttribute('href')).toBe('/profs')
    expect(screen.getByText('Pied')).toBeDefined()
  })

  it('connecté : sidebar et barre d’onglets', () => {
    const { container } = render(
      <AppShell portail="profs" {...connected}>
        <p>Contenu</p>
      </AppShell>,
    )
    expect(screen.getAllByRole('navigation', { name: 'Navigation principale' })).toHaveLength(2)
    expect(container.querySelector('.lpv-o-app-sidebar')).not.toBeNull()
    expect(container.querySelector('.lpv-o-app-tabbar')).not.toBeNull()
    expect(container.querySelector('.lpv-t-app-shell--connected')).not.toBeNull()
  })
})
