import type { ReactNode } from 'react'

import { StatsGrid } from '@/components/templates/t-stats-grid'
import type { DashboardStat } from '@/components/templates/t-stats-grid'

// Compat : StatsGrid et DashboardStat vivent dans t-stats-grid ; on
// ré-exporte pour conserver les chemins d'import historiques.
export { StatsGrid } from './t-stats-grid'
export type { DashboardStat } from './t-stats-grid'

// Template : tableau de bord — grille de stats puis sections titrées.
// Chaque section rend children ; empty fournit un contenu alternatif
// (état vide) piloté par l'appelant.
// Avec `sidebar`, les sections sont posées dans une colonne principale
// et la sidebar dans une colonne latérale (empilées en mobile).
export function DashboardPage({
  stats,
  sections,
  sidebar,
}: {
  stats?: DashboardStat[]
  sections: DashboardSection[]
  sidebar?: ReactNode
}) {
  if (sidebar) {
    return (
      <div className="lpv-t-dashboard-page">
        {stats && stats.length > 0 && <StatsGrid stats={stats} />}
        <div className="lpv-t-dashboard-page__columns">
          <div className="lpv-t-dashboard-page__main">
            {sections.map((section) => (
              <section className="lpv-t-dashboard-page__section" key={section.title}>
                <h2 className="lpv-h2">{section.title}</h2>
                {section.empty ?? section.children}
              </section>
            ))}
          </div>
          <aside className="lpv-t-dashboard-page__aside">{sidebar}</aside>
        </div>
      </div>
    )
  }

  return (
    <div className="lpv-t-dashboard-page">
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
