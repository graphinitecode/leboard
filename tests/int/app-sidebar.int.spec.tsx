import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '@/components/organisms/o-app-sidebar'
import { getShellNav } from '@/utilities/portalNav'

let pathname = '/profs/eleves/3'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

vi.mock('@/components/molecules/m-logout', () => ({
  logout: vi.fn(),
}))

const { account, homeHref, items } = getShellNav('profs', {
  email: 'prof@lpv.fr',
  nom: 'Curie',
  prenom: 'Marie',
  role: 'prof',
})

function renderSidebar() {
  return render(<AppSidebar account={account!} homeHref={homeHref} items={items} />)
}

describe('AppSidebar', () => {
  it('liste les sections avec la section courante active et le logo vers le portail', () => {
    pathname = '/profs/eleves/3'
    renderSidebar()

    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(within(nav).getByRole('link', { name: 'Élèves' }).getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('link', { name: 'Tableau de bord' }).getAttribute('aria-current')).toBeNull()
    expect(within(nav).getByRole('link', { name: /accueil/ }).getAttribute('href')).toBe('/profs')
  })

  it('active le profil sur sa page', () => {
    pathname = '/profs/mon-profil'
    renderSidebar()

    expect(screen.getByRole('link', { name: /Profil/ }).getAttribute('aria-current')).toBe('page')
  })

  it('le bouton « Plus » ouvre le menu du compte et Échap le referme', async () => {
    pathname = '/profs'
    const { container } = renderSidebar()

    const plus = screen.getByRole('button', { name: 'Plus' })
    expect(plus.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(plus)
    expect(plus.getAttribute('aria-expanded')).toBe('true')

    const menu = container.querySelector('.lpv-m-account-menu') as HTMLElement
    expect(within(menu).getByText('prof@lpv.fr')).toBeDefined()
    expect(within(menu).getByRole('link', { name: /Mon profil/ }).getAttribute('href')).toBe('/profs/mon-profil')
    expect(within(menu).getByRole('group', { name: "Thème de l'interface" })).toBeDefined()
    expect(within(menu).getByRole('button', { name: /Se déconnecter/ })).toBeDefined()
    expect(menu.querySelector('input[name="redirectTo"]')?.getAttribute('value')).toBe('/profs/login')

    await userEvent.keyboard('{Escape}')
    expect(container.querySelector('.lpv-m-account-menu')).toBeNull()
  })
})
