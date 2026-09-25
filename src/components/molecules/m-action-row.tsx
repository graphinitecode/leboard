import { Button } from '@/components/atoms/a-button'
import type { Variant } from '@/components/atoms/a-button'

type Accent = 'red' | 'green'

// Molécule : ligne d'action du tableau de bord — titre, méta (date),
// tag optionnel et bouton à droite. Bordure gauche colorée :
// rouge = à traiter, vert = à venir, aucune = neutre.
export function ActionRow({
  title,
  meta,
  tag,
  action,
  accent,
}: {
  title: string
  meta?: string
  tag?: React.ReactNode
  action?: { label: string; href: string; variant?: Variant }
  accent?: Accent
}) {
  const accentClass =
    accent === 'red' ? ' lpv-m-action-row--red' : accent === 'green' ? ' lpv-m-action-row--green' : ''
  return (
    <div className={`lpv-m-action-row${accentClass}`}>
      <div className="lpv-m-action-row__body">
        <span className="lpv-m-action-row__title">{title}</span>
        {(meta || tag) && (
          <span className="lpv-m-action-row__meta">
            {meta && <span className="lpv-muted">{meta}</span>}
            {tag}
          </span>
        )}
      </div>
      {action && (
        <Button href={action.href} variant={action.variant ?? 'secondary'}>
          {action.label}
        </Button>
      )}
    </div>
  )
}