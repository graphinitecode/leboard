import { Icon } from '@/components/atoms/a-icon'
import Link from 'next/link'

type Accent = 'red' | 'blue'

// Molécule : carte d'alerte — bordure gauche colorée (rouge = décrochage,
// bleu = rappel neutre), icône d'avertissement optionnelle, contenu libre
// et lien optionnel vers la fiche.
export function AlertCard({
  titre,
  children,
  href,
  hrefLabel = 'Voir la fiche',
  accent = 'red',
  icon = true,
}: {
  titre: string
  children: React.ReactNode
  href?: string
  hrefLabel?: string
  accent?: Accent
  icon?: boolean
}) {
  const accentClass = accent === 'blue' ? ' lpv-m-alert-card--blue' : ''
  return (
    <div className={`lpv-m-alert-card${accentClass}`}>
      <p className="lpv-m-alert-card__title">
        {icon && <Icon aria-hidden="true" icon="boxicons:alert-triangle" size={18} />}
        <span>{titre}</span>
      </p>
      <div className="lpv-m-alert-card__body">{children}</div>
      {href && (
        <Link className="lpv-link-inline" href={href}>
          {hrefLabel}
        </Link>
      )}
    </div>
  )
}