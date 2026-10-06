import Link from 'next/link'

import type { Footer as FooterData } from '@/payload-types'

import { Icon } from '@/components/atoms/a-icon'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { ThemeToggle } from '@/components/molecules/m-theme-toggle'

// Organism : pied de page commun (site vitrine + portails), fond primaire,
// texte blanc. Tout le contenu vient du global Payload `footer` : accroche,
// colonnes de liens, lien vers l'administration, copyright, liens du bas.
export function Footer({ data }: { data?: FooterData | null }) {
  const columns = data?.columns ?? []
  const bottomLinks = data?.navItems ?? []
  const showAdmin = data?.adminLink?.show ?? true
  const adminLabel = data?.adminLink?.label || 'Espace administration'
  const copyright = data?.copyright || 'Association Les Pierres Vivantes'
  const year = new Date().getFullYear()

  return (
    <footer className="lpv-o-footer">
      <div className="lpv-o-footer__inner">
        <div className="lpv-o-footer__top">
          <div className="lpv-o-footer__brand">
            <Link aria-label="Accueil" className="lpv-o-footer__logo" href="/">
              <Logo />
            </Link>
            {data?.tagline && <p className="lpv-o-footer__tagline">{data.tagline}</p>}
            {showAdmin && (
              <Link className="lpv-o-footer__admin" href="/admin" prefetch={false}>
                <Icon icon="rivet-icons:lock-closed" size={16} />
                {adminLabel}
              </Link>
            )}
          </div>

          {columns.map((column) => (
            <nav aria-label={column.title} className="lpv-o-footer__column" key={column.id}>
              <h2 className="lpv-o-footer__column-title">{column.title}</h2>
              <ul className="lpv-o-footer__list">
                {(column.links ?? []).map(({ id, link }) => (
                  <li key={id}>
                    <CMSLink className="lpv-o-footer__link" {...link} appearance="inline" />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="lpv-o-footer__bottom">
          <p className="lpv-o-footer__copyright">
            © {year} {copyright}. Tous droits réservés.
          </p>
          <nav aria-label="Liens légaux" className="lpv-o-footer__legal">
            {bottomLinks.length > 0 ? (
              bottomLinks.map(({ id, link }) => (
                <CMSLink className="lpv-o-footer__link" key={id} {...link} appearance="inline" />
              ))
            ) : (
              <Link className="lpv-o-footer__link" href="/rgpd">
                Protection des données
              </Link>
            )}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
