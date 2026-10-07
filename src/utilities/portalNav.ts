import type { User } from '@/payload-types'

export type Portail = 'profs' | 'parents'

export type AppNavItem = {
  href: string
  label: string
  // Libellé court de la barre d'onglets mobile (place réduite)
  shortLabel?: string
  icon: string
  // Préfixes supplémentaires qui rendent l'élément actif (ex. le tableau de
  // bord reste actif sur le détail d'une séance qu'il liste)
  match?: string[]
  // Rôles qui voient l'élément ; absent = tous les rôles du portail
  roles?: User['role'][]
}

// Identité affichée par le menu du compte du shell d'appli
export type AccountInfo = {
  nom: string
  email: string
  profileHref: string
  logoutRedirect: string
}

type PortalConfig = {
  homeHref: string
  loginHref: string
  profileHref: string
  roles: User['role'][]
  items: AppNavItem[]
}

export const PORTALS: Record<Portail, PortalConfig> = {
  profs: {
    homeHref: '/profs',
    loginHref: '/profs/login',
    profileHref: '/profs/mon-profil',
    roles: ['prof', 'admin', 'benevole-bibliotheque'],
    items: [
      {
        href: '/profs',
        icon: 'boxicons:home-alt-2-filled',
        label: 'Tableau de bord',
        match: ['/profs/seances'],
        shortLabel: 'Accueil',
      },
      { href: '/profs/calendrier', icon: 'boxicons:calendar-week-filled', label: 'Calendrier' },
      { href: '/profs/eleves', icon: 'boxicons:group-filled', label: 'Élèves' },
      {
        href: '/profs/bibliotheque',
        icon: 'boxicons:book-library-filled',
        label: 'Bibliothèque',
        shortLabel: 'Biblio',
      },
      {
        href: '/profs/disponibilites',
        icon: 'boxicons:calendar-check-filled',
        label: 'Disponibilités',
        shortLabel: 'Dispos',
      },
      {
        href: '/profs/rapports',
        icon: 'boxicons:bar-chart-square-filled',
        label: 'Rapports',
        roles: ['admin', 'prof'],
      },
    ],
  },
  parents: {
    homeHref: '/parents',
    loginHref: '/parents/login',
    profileHref: '/parents/mon-profil',
    roles: ['parent'],
    items: [
      {
        href: '/parents',
        icon: 'boxicons:face-child-filled',
        label: 'Mes enfants',
        match: ['/parents/enfants'],
        shortLabel: 'Enfants',
      },
    ],
  },
}

// Éléments de navigation visibles pour un rôle. Un rôle étranger au portail
// (ou une session absente) n'a pas de navigation : le shell passe en mode
// déconnecté. Confort d'affichage seulement, chaque page garde son contrôle
// d'accès serveur (requireProf, requireParent…).
export function getPortalNav(portail: Portail, role: User['role'] | null | undefined): AppNavItem[] {
  const config = PORTALS[portail]
  if (!role || !config.roles.includes(role)) return []
  return config.items.filter((item) => !item.roles || item.roles.includes(role))
}

// Actif par préfixe de segment (GOV.UK) : /profs/eleves est actif sur
// /profs/eleves/3. L'accueil du portail (/profs) n'est actif qu'à l'identique,
// sinon il le serait sur toutes les pages du portail.
export function isNavLinkActive(
  link: Pick<AppNavItem, 'href' | 'match'>,
  pathname: string,
  homeHref: string,
): boolean {
  const matches = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  if (link.match?.some(matches)) return true
  return link.href === homeHref ? pathname === homeHref : matches(link.href)
}

// Props de navigation du shell pour la session courante : sections visibles
// et compte. Session absente ou rôle étranger au portail : shell déconnecté.
export function getShellNav(
  portail: Portail,
  user: Pick<User, 'role' | 'prenom' | 'nom' | 'email'> | null,
): { homeHref: string; items: AppNavItem[]; account: AccountInfo | null } {
  const config = PORTALS[portail]
  const items = getPortalNav(portail, user?.role)
  return {
    account:
      user && items.length > 0
        ? {
            email: user.email,
            logoutRedirect: config.loginHref,
            nom: `${user.prenom} ${user.nom}`,
            profileHref: config.profileHref,
          }
        : null,
    homeHref: config.homeHref,
    items,
  }
}
