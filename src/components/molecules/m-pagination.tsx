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

// Construit les items de la molécule Pagination à partir d'un total de pages
// et de la page courante (convention GOV.UK) : page 1 et dernière page
// toujours visibles, fenêtre de ±2 autour de la courante élargie à 5 pages
// près des bords, ellipses dans les trous. Jusqu'à 7 pages : tout est listé,
// sans ellipses. hrefFor fabrique le lien d'une page (typiquement ?page=N).
export function buildPaginationItems({
  currentPage,
  hrefFor,
  totalPages,
}: {
  currentPage: number
  hrefFor: (page: number) => string
  totalPages: number
}): (PageNumber | { ellipsis: true })[] {
  if (totalPages <= 1) {
    return []
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      number: index + 1,
      href: hrefFor(index + 1),
      current: index + 1 === currentPage,
    }))
  }

  const numeros = new Set<number>([1, totalPages])
  for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
    if (page >= 1 && page <= totalPages) {
      numeros.add(page)
    }
  }
  // Près des bords : élargir la fenêtre pour éviter une ellipse isolée à
  // côté de la première ou de la dernière page.
  if (currentPage <= 4) {
    for (let page = 2; page <= 5; page += 1) {
      numeros.add(page)
    }
  }
  if (currentPage >= totalPages - 3) {
    for (let page = totalPages - 4; page <= totalPages - 1; page += 1) {
      numeros.add(page)
    }
  }

  const triees = [...numeros].sort((a, b) => a - b)
  const items: (PageNumber | { ellipsis: true })[] = []
  triees.forEach((page, index) => {
    items.push({ number: page, href: hrefFor(page), current: page === currentPage })
    const suivant = triees[index + 1]
    if (suivant !== undefined && suivant > page + 1) {
      items.push({ ellipsis: true })
    }
  })
  return items
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
            scroll={false}
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
                  scroll={false}
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
            scroll={false}
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
