type TagColor = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'violet' | 'magenta' | 'teal'

// Atome : tag de statut. Toujours accompagné d'un libellé texte (jamais la couleur seule).
export function Tag({
  children,
  color = 'blue',
}: {
  children: string
  color?: TagColor
}) {
  return <span className={`lpv-tag lpv-tag--${color}`}>{children}</span>
}