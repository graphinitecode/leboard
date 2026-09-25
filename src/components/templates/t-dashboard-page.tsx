import type { ReactNode } from 'react'

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

export interface DashboardStat {
  value: string | number
  label: string
  type?: string
  detail?: string
  detailColor?: string
}

export interface DashboardSection {
  title: string
  children?: ReactNode
  empty?: ReactNode
}

function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className={`lpv-cards-grid${stats.length === 3 ? ' lpv-cards-grid--3' : ' lpv-cards-grid--4'}`}>
      {stats.map((stat) => (
        <div className={`lpv-card lpv-stat ${stat.type ?? ''}`} key={stat.label}>
          <span className="lpv-stat__value">{stat.value}</span>
          <div className="lpv-stat__label">{stat.label}</div>
          {stat.detail && (
            <div
              className="lpv-stat__detail"
              style={stat.detailColor ? { color: stat.detailColor } : undefined}
            >
              {stat.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
