import type { ReactNode } from 'react'

import { RailPage } from '@/components/templates/t-rail-page'
import { StatsGrid } from '@/components/templates/t-stats-grid'
import type { DashboardStat } from '@/components/templates/t-stats-grid'

// Compat : StatsGrid et DashboardStat vivent dans t-stats-grid ; on
// ré-exporte pour conserver les chemins d'import historiques.
export { StatsGrid } from './t-stats-grid'
export type { DashboardStat } from './t-stats-grid'

// Template : tableau de bord — grille de stats puis sections titrées.
// Chaque section rend children ; empty fournit un contenu alternatif
// (état vide) piloté par l'appelant.
// Avec `sidebar`, la page passe en RailPage : en-tête (`header`, ex. titre
// et salutation) pleine largeur, puis stats et sections dans la colonne
// principale et sidebar dans le rail droit, qui débute au niveau des stats.
export function DashboardPage({
  header,
  stats,
  sections,
  sidebar,
}: {
  header?: ReactNode
  stats?: DashboardStat[]
  sections: DashboardSection[]
  sidebar?: ReactNode
}) {
  if (sidebar) {
    return (
      <div className="lpv-t-dashboard-page">
        <RailPage header={header} rail={sidebar}>
          {stats && stats.length > 0 && <StatsGrid stats={stats} />}
          {sections.map((section) => (
            <section className="lpv-t-dashboard-page__section" key={section.title}>
              <h2 className="lpv-h2">{section.title}</h2>
              {section.empty ?? section.children}
            </section>
          ))}
        </RailPage>
      </div>
    )
  }

  return (
    <div className="lpv-t-dashboard-page">
      {header}
      {stats && stats.length > 0 && <StatsGrid stats={stats} />}
      {sections.map((section) => (
        <section className="lpv-t-dashboard-page__section" key={section.title}>
          <h2 className="lpv-h2">{section.title}</h2>
          {section.empty ?? section.children}
        </section>
      ))}
    </div>
  )
}

export interface DashboardSection {
  title: string
  children?: ReactNode
  empty?: ReactNode
}
