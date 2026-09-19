type Couleur = 'vert' | 'jaune' | 'orange' | 'rouge' | 'violet'

// Atome : tag de statut. Toujours accompagné d'un libellé texte (jamais la couleur seule).
export function Tag({
  children,
  couleur = 'violet',
}: {
  children: string
  couleur?: 'vert' | 'jaune' | 'orange' | 'rouge' | 'violet'
}) {
  return <span className={`lpv-tag lpv-tag--${couleur as VarianteCouleur}`}>{children}</span>
}

type VarianteCouleur = Couleur