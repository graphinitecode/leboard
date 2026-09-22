import Link from 'next/link'

import { Icon } from '@/components/atoms/a-icon'

export interface PageNumber {
  number: number
  href: string
  current?: boolean
}

export interface PaginationLink {
  href: string
  label?: string
}

// Molécule : pagination. Inspiré de GOV.UK Pagination.
// Deux modes : liste (numéros + previous/next alignés) et bloc (descriptif).
// La page courante est un bloc plein inversé (pas un lien) marqué
// aria-current="page" + texte caché « (page actuelle) ».
// En variante liste, « Précédent » disparaît en première page et
// « Suivant » en dernière page (ne pas passer les props correspondantes).
// Utilise Next <Link> pour la navigation côté client.
export function Pagination({
  items,
  previous,
  next,
  ariaLabel = 'Pagination',
  variant = 'list',
}: {
  items: (PageNumber | { ellipsis: true })[]
  previous?: PaginationLink
  next?: PaginationLink
  ariaLabel?: string
  variant?: 'list' | 'block'
}) {
  return (
    <nav aria-label={ariaLabel} className={`lpv-m-pagination${variant === 'block' ? ' lpv-m-pagination--block' : ''}`}>
      {previous && (
        <div className="lpv-m-pagination__previous">
          <Link
            className="lpv-link lpv-m-pagination__link"
            href={previous.href}
            rel="prev"
          >
            {variant === 'block' && previous.label ? (
              <>
                <span aria-hidden="true" className="lpv-m-pagination__icon">
                  <Icon icon="rivet-icons:arrow-left" size={16} />
                </span>
                <span className="lpv-m-pagination__link-title">
                  Précédent
                  {previous.label && (
                    <>
                      <span className="lpv-visually-hidden"> :</span>
                      <span className="lpv-m-pagination__link-label"> {previous.label}</span>
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="lpv-m-pagination__icon">
                  <Icon icon="rivet-icons:arrow-left" size={16} />
                </span>
                Précédent
              </>
            )}
          </Link>
        </div>
      )}

      {variant === 'list' && (
        <ul className="lpv-m-pagination__list">
          {items.map((item, index) =>
            'ellipsis' in item ? (
              <li aria-hidden="true" className="lpv-m-pagination__item lpv-m-pagination__item--ellipsis" key={`ellipsis-${index}`}>
                …
              </li>
            ) : item.current ? (
              <li
                className="lpv-m-pagination__item"
                key={item.number}
              >
                <strong
                  aria-current="page"
                  className="lpv-m-pagination__link lpv-m-pagination__link--current"
                >
                  {item.number}
                  <span className="lpv-visually-hidden"> (page actuelle)</span>
                </strong>
              </li>
            ) : (
              <li
                className="lpv-m-pagination__item"
                key={item.number}
              >
                <Link
                  aria-label={`Page ${item.number}`}
                  className="lpv-link lpv-m-pagination__link"
                  href={item.href}
                >
                  {item.number}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}

      {next && (
        <div className="lpv-m-pagination__next">
          <Link
            className="lpv-link lpv-m-pagination__link"
            href={next.href}
            rel="next"
          >
            {variant === 'block' && next.label ? (
              <>
                <span className="lpv-m-pagination__link-title">
                  Suivant
                  {next.label && (
                    <>
                      <span className="lpv-visually-hidden"> :</span>
                      <span className="lpv-m-pagination__link-label"> {next.label}</span>
                    </>
                  )}
                </span>
                <span aria-hidden="true" className="lpv-m-pagination__icon">
                  <Icon icon="rivet-icons:arrow-right" size={16} />
                </span>
              </>
            ) : (
              <>
                Suivant
                <span aria-hidden="true" className="lpv-m-pagination__icon">
                  <Icon icon="rivet-icons:arrow-right" size={16} />
                </span>
              </>
            )}
          </Link>
        </div>
      )}
    </nav>
  )
}
