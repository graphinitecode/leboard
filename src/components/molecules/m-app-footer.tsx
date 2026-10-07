import Link from 'next/link'

import type { AppFooterData } from '@/utilities/appFooter'

// Molécule : pied de page minimaliste du shell d'appli (portails). Une ligne
// discrète en bas de page : copyright puis liens (retour au site, liens légaux).
// Le pied de page complet (o-footer) reste celui du site vitrine.
export function AppFooter({ copyright, links }: AppFooterData) {
  return (
    <footer className="lpv-m-app-footer">
      <p className="lpv-m-app-footer__copyright">
        © {new Date().getFullYear()} {copyright}
      </p>
      <nav aria-label="Liens du site" className="lpv-m-app-footer__links">
        {links.map((link, index) => (
          <Link
            className="lpv-m-app-footer__link"
            href={link.href}
            key={`${link.href}-${index}`}
            {...(link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
