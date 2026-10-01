// Template : grille de statistiques (cartes lpv-stat).
// Réparti sur 3 colonnes pour 3 stats, 4 au-delà (1 en mobile).
// `type` teinte la bande supérieure et la valeur (success / alert / warning).
export interface DashboardStat {
  value: string | number
  label: string
  type?: string
  detail?: string
  detailColor?: string
}

export function StatsGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <div
      className={`lpv-cards-grid${stats.length === 3 ? ' lpv-cards-grid--3' : ' lpv-cards-grid--4'}`}
    >
      {stats.map((stat) => (
        <div className={`lpv-card lpv-stat ${stat.type ?? ''}`} key={stat.label}>
          <div className={`lpv-stat__color ${stat.type ?? ''}`}></div>
          <div className="lpv-stat__details">
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
        </div>
      ))}
    </div>
  )
}