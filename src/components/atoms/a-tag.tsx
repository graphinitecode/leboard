type Couleur = 'vert' | 'jaune' | 'orange' | 'rouge' | 'bleu' | 'violet' | 'magenta' | 'sarcelle'

// Atome : tag de statut. Toujours accompagné d'un libellé texte (jamais la couleur seule).
export function Tag({
  children,
  couleur = 'bleu',
}: {
  children: string
  couleur?: Couleur
}) {
  return <span className={`lpv-tag lpv-tag--${couleur}`}>{children}</span>
}