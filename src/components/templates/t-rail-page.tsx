import type { ReactNode } from 'react'

// Template : page à rail droit (spec 23). Contenu principal à gauche, rail
// de cartes à droite (≥ 64rem, sticky) terminé par les liens du pied de page ;
// sous 64rem le rail passe sous le contenu. L'ordre DOM (contenu puis rail)
// est l'ordre de lecture.
export function RailPage({ children, rail }: { children: ReactNode; rail: ReactNode }) {
  return (
    <div className="lpv-t-rail">
      <div className="lpv-t-rail__main">{children}</div>
      <aside aria-label="Informations complémentaires" className="lpv-t-rail__aside">
        {rail}
      </aside>
    </div>
  )
}
