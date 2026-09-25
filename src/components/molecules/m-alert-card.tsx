import { Icon } from '@/components/atoms/a-icon'
import Link from 'next/link'

// Molécule : carte d'alerte (décrochage élève) — bordure gauche rouge,
// icône d'avertissement, contenu libre et lien optionnel vers la fiche.
export function AlertCard({
  titre,
  children,
  href,
  hrefLabel = 'Voir la fiche',
}: {
  titre: string
  children: React.ReactNode
  href?: string
  hrefLabel?: string
}) {
  return (
    <div className="lpv-m-alert-card">
      <p className="lpv-m-alert-card__title">
        <Icon aria-hidden="true" icon="boxicons:alert-triangle" size={18} />
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