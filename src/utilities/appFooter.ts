import type { Footer as FooterData } from '@/payload-types'

export type AppFooterLink = { href: string; label: string; newTab?: boolean }

export type AppFooterData = { copyright: string; links: AppFooterLink[] }

// Pied de page minimaliste des portails : retour au site et protection des
// données. Les liens du global `footer` servent au site vitrine, pas à l'appli.
export function toAppFooterData(data?: FooterData | null): AppFooterData {
  return {
    copyright: data?.copyright || 'Association Les Pierres Vivantes',
    links: [
      { href: '/', label: 'Site de l’association' },
      { href: '/rgpd', label: 'Protection des données' },
    ],
  }
}
