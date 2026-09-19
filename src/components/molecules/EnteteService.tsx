import Link from 'next/link'
import type { ReactNode } from 'react'

import { BoutonDeconnexion } from '@/components/atoms/BoutonDeconnexion'
import { LogoLPV } from '@/components/atoms/LogoLPV'
import { PiedPage } from '@/components/molecules/PiedPage'

// Molécule : entête de service des portails (logo + navigation + déconnexion).
// Thème clair forcé : data-theme="light" sur le conteneur.
// Si `afficherDeconnexion` est false (ex. page de login), le bouton est masqué.
export function EnteteService({
  liens,
  libelleService = 'LPV Board',
  deconnexion = false,
}: {
  liens: { href: string; libelle: string }[]
  libelleService?: string
  deconnexion?: boolean
}) {
  return (
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
          {deconnexion && <BoutonDeconnexion />}
        </nav>
      </div>
    </header>
  )
}

// Molécule : conteneur principal des pages portail (contenu + pied de page).
// La classe lpv-shell + data-lpv-portail permettent au CSS de masquer le
// header/footer du site vitrine.
export function ContenuPage({
  children,
  liensPied,
}: {
  children: ReactNode
  liensPied?: { href: string; libelle: string }[]
}) {
  return (
    <div
      className="lpv-shell"
      data-lpv-portail="true"
      data-theme="light"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <PiedPage liens={liensPied} />
    </div>
  )
}