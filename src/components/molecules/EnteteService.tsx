import Link from 'next/link'
import type { ReactNode } from 'react'

import { LogoLPV } from '@/components/atoms/LogoLPV'

// Molécule : entête de service des portails (logo + navigation + skip link).
// Thème clair forcé : data-theme="light" sur le conteneur.
export function EnteteService({
  liens,
  libelleService = 'LPV Board',
}: {
  liens: { href: string; libelle: string }[]
  libelleService?: string
}) {
  return (
    <>
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      <header className="lpv-entete" data-theme="light">
        <div className="lpv-entete__inner">
          <Link className="lpv-entete__logo" href="/">
            <LogoLPV libelle={libelleService} />
          </Link>
          <nav aria-label="Navigation du service" className="lpv-entete__nav">
            {liens.map((lien) => (
              <Link href={lien.href} key={lien.href}>
                {lien.libelle}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}

// Molécule : conteneur principal des pages portail
export function ContenuPage({ children }: { children: ReactNode }) {
  return (
    <main className="lpv-container" data-theme="light" id="contenu-principal">
      {children}
    </main>
  )
}