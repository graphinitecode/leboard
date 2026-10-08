import type { ReactNode } from 'react'

// Template : page à rail droit (spec 23). Contenu principal à gauche, rail
// de cartes à droite (≥ 64rem, sticky) terminé par les liens du pied de page ;
// sous 64rem le rail passe sous le contenu. L'ordre DOM (contenu puis rail)
// est l'ordre de lecture. `header` (retour, titre, sous-titre) s'affiche
// pleine largeur au-dessus : le rail débute alors au niveau du contenu
// (stats, sections), pas en haut de page.
export function RailPage({
  children,
  header,
  rail,
}: {
  children: ReactNode
  header?: ReactNode
  rail: ReactNode
}) {
  return (
    <>
      {header}
      <div className="lpv-t-rail">
        <div className="lpv-t-rail__main">{children}</div>
        <aside aria-label="Informations complémentaires" className="lpv-t-rail__aside">
          {rail}
        </aside>
      </div>
    </>
  )
}
