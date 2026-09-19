import Link from 'next/link'
import type { ReactNode } from 'react'

import { BoutonDeconnexion } from '@/components/atoms/BoutonDeconnexion'
import { LogoLPV } from '@/components/atoms/LogoLPV'
import { PiedPage } from '@/components/molecules/PiedPage'

// Molécule : entête de service des portails (logo + navigation + identité + déconnexion).
// Thème clair forcé : data-theme="light" sur le conteneur.
// `nomUtilisateur` : affiche « Connecté en tant que … » ; si null, rien (page login).
export function EnteteService({
  liens,
  libelleService = 'LPV Board',
  nomUtilisateur,
  deconnexion = false,
}: {
  liens: { href: string; libelle: string }[]
  libelleService?: string
  nomUtilisateur?: string | null
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
          {nomUtilisateur && (
            <span
              aria-label={`Connecté en tant que ${nomUtilisateur}`}
              className="lpv-entete__user"
            >
              {nomUtilisateur}
            </span>
          )}
          {deconnexion && <BoutonDeconnexion />}
        </nav>
      </div>
    </header>
  )
}

// Molécule : conteneur principal des pages portail (contenu + pied de page).
// La classe lpv-shell + data-lpv-portail permettent au CSS de masquer le
// header/footer du site vitrine.
export function ContenuPage({ children, liensPied }: { children: ReactNode; liensPied?: { href: string; libelle: string }[] }) {
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