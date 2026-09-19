type Couleur = 'vert' | 'jaune' | 'orange' | 'rouge' | 'bleu'

// Atome : tag de statut. Toujours accompagné d'un libellé texte (jamais la couleur seule).
export function Tag({
  children,
  couleur = 'bleu',
}: {
  children: string
  couleur?: 'vert' | 'jaune' | 'orange' | 'rouge' | 'bleu'
}) {
  return <span className={`lpv-tag lpv-tag--${couleur}`}>{children}</span>
}