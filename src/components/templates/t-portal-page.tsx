import type { ReactNode } from 'react'

import { Footer } from '@/components/molecules/m-footer'
import { BackLink } from '@/components/atoms/a-back-link'
import { StatsGrid } from '@/components/templates/t-dashboard-page'
import type { DashboardStat } from '@/components/templates/t-dashboard-page'

// Template : shell complet d'une page de portail.
// portail: 'profs' (bleu, défaut) | 'parents' (violet) | 'eleves' (orange) —
// pilote la couleur via data-lpv-portail. Masque le chrome du site vitrine.
// header : slot recevant la molécule ServiceHeader.
export function PortalPage({
  children,
  header,
  footerLinks,
  portail = 'profs',
}: {
  children: ReactNode
  header?: ReactNode
  footerLinks?: { href: string; label: string }[]
  portail?: 'profs' | 'parents' | 'eleves'
}) {
  return (
    <div
      className="lpv-t-portal-page lpv-shell"
      data-lpv-portail={portail}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      {header}
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer links={footerLinks} />
    </div>
  )
}

// Template : squelette de page détail (fiche entité) — back link, titre + tag
// optionnel, meta optionnelle (ex. SummaryList), puis sections h2 + contenu.
// Variante riche (maquette fiche élève) : `stats` affiche la grille de compteurs
// en tête ; `sidebar` pose les sections en 2 colonnes (2fr/1fr) avec une colonne
// latérale (empilées en mobile) ; `caption` est le sous-titre sous le titre.
export function DetailPage({
  backHref,
  backLabel,
  title,
  caption,
  tag,
  meta,
  stats,
  sections,
  sidebar,
}: {
  backHref: string
  backLabel: string
  title: ReactNode
  tag?: ReactNode
  caption?: ReactNode
  meta?: ReactNode
  stats?: DashboardStat[]
  sections: { title: string; children: ReactNode }[]
  sidebar?: ReactNode
}) {
  return (
    <div className="lpv-t-detail-page">
      <BackLinkRow backHref={backHref} backLabel={backLabel} />
      <h1 className="lpv-t-detail-page__title">
        {title} {tag}
      </h1>
      {caption ? <p className="lpv-t-detail-page__caption">{caption}</p> : null}
      {meta}
      {stats && stats.length > 0 && <StatsGrid stats={stats} />}
      {sidebar ? (
        <div className="lpv-t-dashboard-page__columns">
          <div className="lpv-t-dashboard-page__main">
            {sections.map((section) => (
              <DetailSection key={section.title} title={section.title}>
                {section.children}
              </DetailSection>
            ))}
          </div>
          <aside className="lpv-t-dashboard-page__aside">{sidebar}</aside>
        </div>
      ) : (
        sections.map((section) => (
          <DetailSection key={section.title} title={section.title}>
            {section.children}
          </DetailSection>
        ))
      )}
    </div>
  )
}

function BackLinkRow({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <div className="lpv-t-detail-page__back">
      <BackLink href={backHref}>{backLabel}</BackLink>
    </div>
  )
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="lpv-t-detail-page__section">
      <h2 className="lpv-h2">{title}</h2>
      {children}
    </section>
  )
}