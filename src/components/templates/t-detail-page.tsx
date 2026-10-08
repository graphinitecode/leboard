import type { ReactNode } from 'react'

import { BackLink } from '@/components/atoms/a-back-link'
import { Icon } from '@/components/atoms/a-icon'
import { RailPage } from '@/components/templates/t-rail-page'
import { StatsGrid } from '@/components/templates/t-stats-grid'
import type { DashboardStat } from '@/components/templates/t-stats-grid'

// Template : squelette de page détail (fiche entité) — back link, titre + tag
// optionnel, meta optionnelle (ex. SummaryList), puis sections h2 + contenu.
// Variante riche (maquette fiche élève) : `stats` affiche la grille de compteurs
// en tête ; `sidebar` passe la page en RailPage (toute la fiche à gauche, sidebar
// dans le rail droit, dessous en mobile ; le rail débute sous le titre) ; `caption` est le sous-titre.
// Chaque section peut porter une `action` (lien + libellé) alignée à droite du
// titre ; `download` en fait un lien de téléchargement (export CSV…) et
// `icon` (Iconify, ex. rivet-icons:save) précède le libellé.
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
  sections: { title: string; action?: DetailSectionAction; children: ReactNode }[]
  sidebar?: ReactNode
}) {
  const header = (
    <>
      <BackLinkRow backHref={backHref} backLabel={backLabel} />
      <h1 className="lpv-h2">{title}{tag && <span className='pl-4'>{tag}</span>}</h1>
      {caption ? <p className="lpv-t-detail-page__caption">{caption}</p> : null}
    </>
  )

  const body = (
    <>
      {meta}
      {stats && stats.length > 0 && <StatsGrid stats={stats} />}
      {sections.map((section) => (
        <DetailSection action={section.action} key={section.title} title={section.title}>
          {section.children}
        </DetailSection>
      ))}
    </>
  )

  return (
    <div className="lpv-t-detail-page">
      {sidebar ? (
        <RailPage header={header} rail={sidebar}>
          {body}
        </RailPage>
      ) : (
        <>
          {header}
          {body}
        </>
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

export interface DetailSectionAction {
  href: string
  label: string
  download?: boolean
  icon?: string
}

export function DetailSection({
  title,
  action,
  children,
}: {
  title: string
  action?: DetailSectionAction
  children: ReactNode
}) {
  return (
    <section className="lpv-t-detail-page__section">
      {action ? (
        <div className="lpv-t-detail-page__section-header">
          <h2 className="lpv-h2">{title}</h2>
          {/* Lien simple (pas de navigation client) : la cible peut être un fichier */}
          <a
            className="lpv-link-inline lpv-t-detail-page__section-action"
            download={action.download || undefined}
            href={action.href}
          >
            {action.icon && <Icon icon={action.icon} size={18} />}
            {action.label}
          </a>
        </div>
      ) : (
        <h2 className="lpv-h2">{title}</h2>
      )}
      {children}
    </section>
  )
}
