import { describe, expect, it } from 'vitest'

import { getPortalNav, getShellNav, isNavLinkActive, PORTALS } from '@/utilities/portalNav'

const USER = { email: 'prof@lpv.fr', nom: 'Curie', prenom: 'Marie', role: 'prof' as const }

describe('isNavLinkActive', () => {
  const [home, , eleves] = PORTALS.profs.items

  it("n'active l'accueil du portail qu'à l'identique ou sur ses préfixes déclarés", () => {
    expect(isNavLinkActive(home, '/profs', '/profs')).toBe(true)
    expect(isNavLinkActive(home, '/profs/eleves', '/profs')).toBe(false)
    expect(isNavLinkActive(home, '/profs/seances/12', '/profs')).toBe(true)
  })

  it('active une section par préfixe de segment', () => {
    expect(isNavLinkActive(eleves, '/profs/eleves/3', '/profs')).toBe(true)
    expect(isNavLinkActive(eleves, '/profs/eleves-archives', '/profs')).toBe(false)
  })
})

describe('getPortalNav', () => {
  it('donne les sections du portail aux rôles du portail', () => {
    expect(getPortalNav('profs', 'prof').map((i) => i.label)).toEqual([
      'Tableau de bord',
      'Calendrier',
      'Élèves',
      'Bibliothèque',
      'Disponibilités',
      'Rapports',
    ])
    expect(getPortalNav('profs', 'benevole-bibliotheque').map((i) => i.label)).not.toContain('Rapports')
    expect(getPortalNav('parents', 'parent').map((i) => i.label)).toEqual(['Mes enfants'])
  })

  it("ne donne rien sans session ou à un rôle étranger au portail", () => {
    expect(getPortalNav('profs', null)).toEqual([])
    expect(getPortalNav('profs', 'parent')).toEqual([])
    expect(getPortalNav('parents', 'prof')).toEqual([])
  })
})

describe('getShellNav', () => {
  it('construit le compte avec profil et connexion du portail', () => {
    const { account, homeHref, items } = getShellNav('profs', USER)
    expect(homeHref).toBe('/profs')
    expect(items.length).toBeGreaterThan(0)
    expect(account).toEqual({
      email: 'prof@lpv.fr',
      logoutRedirect: '/profs/login',
      nom: 'Marie Curie',
      profileHref: '/profs/mon-profil',
    })
  })

  it('passe en déconnecté pour une session absente ou hors portail', () => {
    expect(getShellNav('profs', null).account).toBeNull()
    expect(getShellNav('parents', USER).account).toBeNull()
  })
})
