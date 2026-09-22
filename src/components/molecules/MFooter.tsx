import Link from 'next/link'

import { LogoLPV } from '@/components/atoms/LogoLPV'

// Pied de page des portails LPV Board (cohérent avec EnteteService).
// Hérite du thème dark/light depuis <html> data-theme.
export function MFooter({
  liens = [],
  mention = 'Association Les Pierres Vivantes — cours de soutien',
}: {
  liens?: { href: string; libelle: string }[]
  mention?: string
}) {
  return (
    <footer className="lpv-pied">
      <div className="lpv-pied__inner">
        <div>
          <span className="lpv-pied__logo">
            <LogoLPV libelle="LPV Board" />
          </span>
          <p className="lpv-pied__mention">{mention}</p>
        </div>

        <nav aria-label="Liens de pied de page" className="lpv-pied__nav">
          <Link href="/rgpd">Protection des données</Link>
          {liens.map((lien) => (
            <Link href={lien.href} key={`${lien.href} ${lien.libelle}`}>
              {lien.libelle}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
