import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AppTabbar } from '@/components/organisms/o-app-tabbar'
import { getShellNav } from '@/utilities/portalNav'

let pathname = '/profs'

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

describe('AppTabbar', () => {
  it('affiche 4 onglets à libellé court puis « Plus »', () => {
    pathname = '/profs'
    render(<AppTabbar account={account!} homeHref={homeHref} items={items} />)

    const nav = screen.getByRole('navigation', { name: 'Navigation principale' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => l.textContent)).toEqual(['Accueil', 'Calendrier', 'Élèves', 'Biblio'])
    expect(links[0].getAttribute('aria-current')).toBe('page')
    expect(within(nav).getByRole('button', { name: 'Plus' })).toBeDefined()
  })

  it('« Plus » ouvre une feuille avec les sections restantes et le compte', async () => {
    pathname = '/profs'
    render(<AppTabbar account={account!} homeHref={homeHref} items={items} />)

    await userEvent.click(screen.getByRole('button', { name: 'Plus' }))

    const sheet = screen.getByRole('dialog', { name: 'Plus' })
    expect(within(sheet).getByRole('link', { name: 'Disponibilités' }).getAttribute('href')).toBe(
      '/profs/disponibilites',
    )
    expect(within(sheet).getByRole('link', { name: 'Rapports' }).getAttribute('href')).toBe('/profs/rapports')
    expect(within(sheet).getByRole('link', { name: /Mon profil/ })).toBeDefined()
    expect(within(sheet).getByRole('button', { name: /Se déconnecter/ })).toBeDefined()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Plus' })).toBeNull()
  })

  it('marque « Plus » actif quand la page courante est une section repliée', () => {
    pathname = '/profs/disponibilites/nouvelle'
    render(<AppTabbar account={account!} homeHref={homeHref} items={items} />)

    expect(screen.getByRole('button', { name: 'Plus' }).className).toContain('lpv-o-app-tabbar__tab--active')
  })
})
