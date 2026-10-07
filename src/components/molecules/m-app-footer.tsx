import Link from 'next/link'

import type { Footer as FooterData } from '@/payload-types'

import { CMSLink } from '@/components/Link'

// Molécule : pied de page minimaliste du shell d'appli (portails). Une ligne
// discrète : copyright, retour au site, liens légaux du global Payload
// `footer` (navItems), à défaut la politique de protection des données.
// Le pied de page complet (o-footer) reste celui du site vitrine.
export function AppFooter({ data }: { data?: FooterData | null }) {
  const legalLinks = data?.navItems ?? []
  const copyright = data?.copyright || 'Association Les Pierres Vivantes'

  return (
    <footer className="lpv-m-app-footer">
      <p className="lpv-m-app-footer__copyright">
        © {new Date().getFullYear()} {copyright}
      </p>
      <nav aria-label="Liens du site" className="lpv-m-app-footer__links">
        <Link className="lpv-m-app-footer__link" href="/">
          Site de l&rsquo;association
        </Link>
        {legalLinks.length > 0 ? (
          legalLinks.map(({ id, link }) => (
            <CMSLink className="lpv-m-app-footer__link" key={id} {...link} appearance="inline" />
          ))
        ) : (
          <Link className="lpv-m-app-footer__link" href="/rgpd">
            Protection des données
          </Link>
        )}
      </nav>
    </footer>
  )
}
