import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppSidebar } from '@/components/organisms/o-app-sidebar'
import { getShellNav } from '@/utilities/portalNav'

let pathname = '/profs/eleves/3'

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}))

const setTheme = vi.fn()
let themeMode: 'auto' | 'light' | 'dark' = 'auto'

vi.mock('@/providers/Theme', () => ({
  useTheme: () => ({ setTheme, theme: undefined, themeMode }),
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

  it('porte la bascule de thème et la déconnexion vers la connexion du portail, sans menu « Plus »', () => {
    pathname = '/profs'
    const { container } = renderSidebar()

    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    expect(within(nav).getByRole('button', { name: /changer de thème/ })).toBeDefined()
    expect(within(nav).getByRole('button', { name: /Se déconnecter/ })).toBeDefined()
    expect(container.querySelector('input[name="redirectTo"]')?.getAttribute('value')).toBe('/profs/login')
    expect(within(nav).queryByRole('button', { name: 'Plus' })).toBeNull()
  })

  it('fait défiler le thème machine → clair → sombre → machine', () => {
    pathname = '/profs'
    setTheme.mockClear()

    themeMode = 'auto'
    const { rerender } = renderSidebar()
    fireEvent.click(screen.getByRole('button', { name: /Thème : machine/ }))
    expect(setTheme).toHaveBeenLastCalledWith('light')

    themeMode = 'light'
    rerender(<AppSidebar account={account!} homeHref={homeHref} items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /Mode clair/ }))
    expect(setTheme).toHaveBeenLastCalledWith('dark')

    themeMode = 'dark'
    rerender(<AppSidebar account={account!} homeHref={homeHref} items={items} />)
    fireEvent.click(screen.getByRole('button', { name: /Mode sombre/ }))
    expect(setTheme).toHaveBeenLastCalledWith(null)
  })
})
