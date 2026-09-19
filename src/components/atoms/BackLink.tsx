// Atome : lien de retour (chevron gauche), couleur du portail courant.
// Utilisé pour la navigation arrière (page précédente, étape précédente).
// Sur mobile, le chevron ← est affiché avant le libellé.
export function BackLink({
  href,
  children = 'Retour',
  onClick,
}: {
  href: string
  children?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <a
      className="lpv-back-link"
      href={href}
      onClick={onClick}
    >
      <span aria-hidden="true">← </span>
      {children}
    </a>
  )
}