import Link from 'next/link'
import type { ReactNode } from 'react'

import { PiedPage } from '@/components/molecules/PiedPage'

import { seDeconnecter } from './seDeconnecter'
import { MenuDepliant } from './MenuDepliant'

// Molécule : entête bleue pleine largeur (visuels LPV).
// Logo blanc « Association Les Pierres Vivantes » + bouton Menu dépliant + identité.
// Le hero est fusionné dans la même bande bleue (prop hero).
export function EnteteService({
  heroTitre,
  heroTexte,
  libelleService = 'Association Les Pierres Vivantes',
  nomUtilisateur,
  deconnexion = false,
  services,
  legales,
}: {
  heroTitre?: string
  heroTexte?: string
  libelleService?: string
  nomUtilisateur?: string | null
  deconnexion?: boolean
  services: { href: string; libelle: string; description?: string }[]
  legales: { href: string; libelle: string; description?: string }[]
}) {
  return (
    <header className="lpv-entete-bleue" data-theme="light">
      <div className="lpv-entete-bleue__inner">
        <Link className="lpv-entete-bleue__logo" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" className="lpv-entete-bleue__logo-img" src="/lpv-logo-white.svg" />
          <span className="lpv-entete-bleue__logo-texte">
            <small>Association</small>
            <strong>Les Pierres Vivantes</strong>
          </span>
        </Link>

        <div className="lpv-entete-bleue__actions">
          {nomUtilisateur && (
            <span
              aria-label={`Connecté en tant que ${nomUtilisateur}`}
              className="lpv-entete-bleue__user"
            >
              {nomUtilisateur}
            </span>
          )}
          {deconnexion && (
            <form action={seDeconnecter}>
              <button className="lpv-menu-bouton" type="submit">
                Se déconnecter
              </button>
            </form>
          )}
          <MenuDepliant services={services} legales={legales} />
        </div>
      </div>

      {heroTitre && (
        <div className="lpv-entete-bleue__hero">
          <h1 className="lpv-entete-bleue__hero-titre">{heroTitre}</h1>
          {heroTexte ? <p className="lpv-entete-bleue__hero-texte">{heroTexte}</p> : null}
        </div>
      )}
    </header>
  )
}

// Molécule : conteneur principal des pages portail (shell).
// La classe .lpv-shell permet au CSS de masquer le header/footer du site vitrine.
export function ContenuPage({
  children,
  entete,
  liensPied,
}: {
  children: ReactNode
  entete?: ReactNode
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
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <PiedPage liens={liensPied} />
    </div>
  )
}