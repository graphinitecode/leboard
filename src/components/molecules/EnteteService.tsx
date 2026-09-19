import Link from 'next/link'
import type { ReactNode } from 'react'

import { BoutonDeconnexion } from '@/components/atoms/BoutonDeconnexion'
import { LogoLPV } from '@/components/atoms/LogoLPV'
import { PiedPage } from '@/components/molecules/PiedPage'

// Molécule : entête de service des portails (logo + navigation + identité + déconnexion).
// `nomUtilisateur` : affiche le nom connecté ; si null, rien (page login).
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

// Molécule : conteneur principal des pages portail.
// Regroupe entête + hero optionnel + contenu + pied de page dans un seul shell :
// la classe .lpv-shell permet au CSS de masquer le header/footer du site vitrine
// (body:has(.lpv-shell) > header, > footer, > .admin-bar).
export function ContenuPage({
  children,
  entete,
  hero,
  liensPied,
}: {
  children: ReactNode
  entete?: ReactNode
  hero?: ReactNode
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
      {entete}
      {hero}
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <PiedPage liens={liensPied} />
    </div>
  )
}