// Atome : lien de retour (chevron gauche)
export function BackLink({ href, children = 'Retour' }: { href: string; children?: string }) {
  return (
    <a
      href={href}
      style={{
        color: 'var(--lpv-blue-dark)',
        display: 'inline-block',
        marginBottom: '0.75rem',
        textDecoration: 'none',
      }}
    >
      <span aria-hidden="true">← </span>
      {children}
    </a>
  )
}