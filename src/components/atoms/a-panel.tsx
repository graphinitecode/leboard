import type { ReactNode } from 'react'

// Atome : encadré d'information (fond gris, bordure bleu clair)
export function InsetText({ children }: { children: ReactNode }) {
  return <div className="lpv-inset">{children}</div>
}

// Atome : panel mis en avant (fond bleu clair), variante succès (vert)
export function Panel({
  children,
  variante = 'info',
}: {
  children: ReactNode
  variante?: 'info' | 'success'
}) {
  return (
    <div className={`lpv-a-panel${variante === 'success' ? ' lpv-a-panel--success' : ''}`}>{children}</div>
  )
}
