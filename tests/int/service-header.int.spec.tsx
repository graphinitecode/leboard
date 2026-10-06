import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ServiceHeader } from '@/components/molecules/m-service-header'
import { isNavLinkActive } from '@/components/molecules/m-portal-nav'

let pathname = '/profs/eleves/3'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('@/components/molecules/m-logout', () => ({
  logout: vi.fn(),
}))

const NAV = [
  { href: '/profs', label: 'Tableau de bord', match: ['/profs/seances'] },
  { href: '/profs/eleves', label: 'Élèves' },
  { href: '/profs/bibliotheque', label: 'Bibliothèque' },
]

const USER = {
  email: 'prof@lpv.fr',
  logoutRedirect: '/profs/login',
  nom: 'Marie Curie',
  profileHref: '/profs/mon-profil',
}

describe('isNavLinkActive', () => {
  it("n'active l'accueil du portail qu'à l'identique ou sur ses préfixes déclarés", () => {
    expect(isNavLinkActive(NAV[0], '/profs', '/profs')).toBe(true)
    expect(isNavLinkActive(NAV[0], '/profs/eleves', '/profs')).toBe(false)
    expect(isNavLinkActive(NAV[0], '/profs/seances/12', '/profs')).toBe(true)
  })

  it('active une section par préfixe de segment', () => {
    expect(isNavLinkActive(NAV[1], '/profs/eleves/3', '/profs')).toBe(true)
    expect(isNavLinkActive(NAV[1], '/profs/eleves-archives', '/profs')).toBe(false)
  })
})

describe('ServiceHeader', () => {
  it('connecté : onglets de navigation avec la section courante active, logo vers le portail', () => {
    pathname = '/profs/eleves/3'
    render(<ServiceHeader homeHref="/profs" navLinks={NAV} user={USER} />)

    const nav = screen.getByRole('navigation', { name: 'Navigation du portail' })
    expect(within(nav).getByRole('link', { name: 'Élèves' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('link', { name: 'Tableau de bord' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByRole('link', { name: /accueil/ }).getAttribute('href')).toBe('/profs')
    // Un seul menu : plus de bouton « Menu » à côté de l'avatar
    expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull()
  })

  it("le menu du compte regroupe navigation, profil, thème et déconnexion vers la connexion du portail", async () => {
    pathname = '/profs'
    const { container } = render(<ServiceHeader homeHref="/profs" navLinks={NAV} user={USER} />)

    await userEvent.click(screen.getByRole('button', { name: /Connecté en tant que Marie Curie/ }))

    const panel = container.querySelector('.lpv-m-avatar-panel') as HTMLElement
    expect(within(panel).getByText('prof@lpv.fr')).toBeDefined()
    expect(within(panel).getByRole('link', { name: 'Bibliothèque' }).getAttribute('href')).toBe('/profs/bibliotheque')
    expect(within(panel).getByRole('link', { name: /Mon profil/ }).getAttribute('href')).toBe('/profs/mon-profil')
    expect(within(panel).getByRole('group', { name: "Thème de l'interface" })).toBeDefined()
    expect(within(panel).getByRole('button', { name: /Se déconnecter/ })).toBeDefined()
    expect(panel.querySelector('input[name="redirectTo"]')?.getAttribute('value')).toBe('/profs/login')
  })

  it('déconnecté : ni navigation ni menu du compte', () => {
    render(<ServiceHeader heroTitle="Connexion" homeHref="/profs" navLinks={NAV} user={null} />)

    expect(screen.queryByRole('navigation', { name: 'Navigation du portail' })).toBeNull()
    expect(screen.queryByRole('button', { name: /Connecté en tant que/ })).toBeNull()
    expect(screen.queryByRole('group', { name: "Thème de l'interface" })).toBeNull()
    expect(screen.getByRole('heading', { name: 'Connexion' })).toBeDefined()
  })
})
