import type { ReactNode } from 'react'
import { Icon } from '@/components/atoms/a-icon'

// Atome : encadré d'information (fond gris, bordure bleu clair)
export function InsetText({ children }: { children: ReactNode }) {
  return <div className="lpv-a-inset">{children}</div>
}

const getIcon = (variante?: string) => {
  if (variante === 'success') return 'rivet-icons:check-circle-breakout'
  if (variante === 'warning') return 'rivet-icons:caution'
  if (variante === 'error' || variante === 'alert' || variante === 'danger')
    return 'rivet-icons:exclamation-mark-circle'
  return 'rivet-icons:info-circle'
}

// Atome : panel mis en avant (fond bleu clair), variante succès (vert)
export function Panel({
  title,
  children,
  variante = 'info',
}: {
  title?: string
  children: ReactNode
  variante?: 'info' | 'success' | 'error' | 'alert' | 'danger' | 'warning'
}) {
  return (
    <div
      className={`lpv-a-panel lpv-a-panel--${variante}`}
    >
      {title && (
        <h1 className="lpv-a-panel__title">
          <Icon icon={getIcon(variante)} size={29} />
          {title}
        </h1>
      )}
      <div className="lpv-a-panel__children">{children}</div>
    </div>
  )
}
