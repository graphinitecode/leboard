import Link from 'next/link'
import type { ReactNode } from 'react'

import { MFooter } from '@/components/molecules/MFooter'
import { Avatar } from '@/components/molecules/Avatar'

import { MenuDepliant } from './MenuDepliant'

// Molécule : entête pleine largeur du portail (couleur selon data-lpv-portail).
// Logo blanc « Association Les Pierres Vivantes » + Menu dépliant + identité.
// Le hero est fusionné dans la même bande colorée.
// utilisateur : session serveur (getMeUserServer) — connecté : avatar dropdown
// + séparateur vertical avant le menu, sinon rien (les pages login n'affichent
// pas d'identité).
export function EnteteService({
  heroTitre,
  heroTexte,
  utilisateur,
  services,
  legales,
}: {
  heroTitre?: string
  heroTexte?: string
  utilisateur?: { nom: string; email: string } | null
  services: { href: string; libelle: string; description?: string }[]
  legales: { href: string; libelle: string; description?: string }[]
}) {
  return (
    <header className="lpv-entete-bleue">
      <div className="lpv-entete-bleue__inner">
        <Link className="lpv-entete-bleue__logo" href="/">
          {/* Deux rendus du logo, la bascule est faite par CSS :
              slim (symbole seul) en mobile, large (inscription incluse) ≥ 48rem. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes"
            className="lpv-entete-bleue__logo-slim"
            height={93}
            src="/lpv-logo-white.svg"
            width={131}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Association Les Pierres Vivantes"
            className="lpv-entete-bleue__logo-large"
            height={93}
            src="/lpv-logo_large.png"
            width={499}
          />
        </Link>

        <div className="lpv-entete-bleue__actions">
          {utilisateur && <Avatar email={utilisateur.email} nom={utilisateur.nom} />}
          {utilisateur && <span aria-hidden="true" className="lpv-entete-separateur" />}
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
// portail: 'profs' (bleu, défaut) | 'parents' (violet) | 'eleves' (orange) —
// pilote la couleur via data-lpv-portail. Masque le chrome du site vitrine.
export function ContenuPage({
  children,
  entete,
  liensPied,
  portail = 'profs',
}: {
  children: ReactNode
  entete?: ReactNode
  liensPied?: { href: string; libelle: string }[]
  portail?: 'profs' | 'parents' | 'eleves'
}) {
  return (
    <div
      className="lpv-shell"
      data-lpv-portail={portail}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      {entete}
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <MFooter liens={liensPied} />
    </div>
  )
}
