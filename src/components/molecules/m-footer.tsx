import Link from 'next/link'

import { LogoLPV } from '@/components/atoms/a-logo-lpv'

// Pied de page des portails LPV Board (cohérent avec ServiceHeader).
// Hérite du thème dark/light depuis <html> data-theme.
export function Footer({
  links = [],
  tagline = 'Association Les Pierres Vivantes — cours de soutien',
}: {
  links?: { href: string; label: string }[]
  tagline?: string
}) {
  return (
    <footer className="lpv-m-footer">
      <div className="lpv-m-footer__inner">
        <div>
          <span className="lpv-m-footer__logo">
            <LogoLPV label="LPV Board" />
          </span>
          <p className="lpv-m-footer__tagline">{tagline}</p>
        </div>

        <nav aria-label="Liens de pied de page" className="lpv-m-footer__nav">
          <Link href="/rgpd">Protection des données</Link>
          {links.map((link) => (
            <Link href={link.href} key={`${link.href} ${link.label}`}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
