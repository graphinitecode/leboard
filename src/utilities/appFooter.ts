import type { Footer as FooterData } from '@/payload-types'

export type AppFooterLink = { href: string; label: string; newTab?: boolean }

export type AppFooterData = { copyright: string; links: AppFooterLink[] }

type CmsLink = NonNullable<FooterData['navItems']>[number]['link']

// Même résolution que CMSLink : référence vers une page (/slug) ou un article
// (/posts/slug), sinon URL personnalisée.
function resolveHref(link: CmsLink): string | null {
  if (link.type === 'reference' && typeof link.reference?.value === 'object' && link.reference.value.slug) {
    const prefix = link.reference.relationTo === 'pages' ? '' : `/${link.reference.relationTo}`
    return `${prefix}/${link.reference.value.slug}`
  }
  return link.url ?? null
}

// Pied de page minimaliste des portails, à plat : retour au site puis liens légaux du global
// Payload `footer` (navItems), à défaut la politique de protection des données.
export function toAppFooterData(data?: FooterData | null): AppFooterData {
  const legal: AppFooterLink[] = (data?.navItems ?? []).flatMap(({ link }) => {
    const href = resolveHref(link)
    return href ? [{ href, label: link.label, newTab: Boolean(link.newTab) }] : []
  })

  return {
    copyright: data?.copyright || 'Association Les Pierres Vivantes',
    links: [
      { href: '/', label: 'Site de l’association' },
      ...(legal.length > 0 ? legal : [{ href: '/rgpd', label: 'Protection des données' }]),
    ],
  }
}
