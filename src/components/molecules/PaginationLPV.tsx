import Link from 'next/link'

import { Icon } from '@/components/atoms/Icon'

export interface PageNumero {
  numero: number
  href: string
  courant?: boolean
}

export interface LienPagination {
  href: string
  libelle?: string
}

// Molécule : pagination. Inspiré de GOV.UK Pagination.
// Deux modes : liste (numéros + previous/next) et bloc (descriptif).
// Utilise Next <Link> pour la navigation côté client.
export function PaginationLPV({
  items,
  precedente,
  suivante,
  libelleRepere = 'Pagination',
  variante = 'liste',
}: {
  items: (PageNumero | { ellipsis: true })[]
  precedente?: LienPagination
  suivante?: LienPagination
  libelleRepere?: string
  variante?: 'liste' | 'bloc'
}) {
  return (
    <nav aria-label={libelleRepere} className={`lpv-pagination${variante === 'bloc' ? ' lpv-pagination--bloc' : ''}`}>
      {precedente && (
        <div className="lpv-pagination__precedent">
          <Link
            className="lpv-link lpv-pagination__lien"
            href={precedente.href}
            rel="prev"
          >
            {variante === 'bloc' && precedente.libelle ? (
              <>
                <span aria-hidden="true" className="lpv-pagination__icone lpv-pagination__icone--precedent">
                  <Icon icone="rivet-icons:arrow-left" taille={16} />
                </span>
                <span className="lpv-pagination__lien-titre">
                  Précédent
                  {precedente.libelle && (
                    <>
                      <span className="lpv-visually-hidden"> :</span>
                      <span className="lpv-pagination__lien-libelle"> {precedente.libelle}</span>
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="lpv-pagination__icone lpv-pagination__icone--precedent">
                  <Icon icone="rivet-icons:arrow-left" taille={16} />
                </span>
                Précédent
              </>
            )}
          </Link>
        </div>
      )}

      {variante === 'liste' && (
        <ul className="lpv-pagination__liste">
          {items.map((item, index) =>
            'ellipsis' in item ? (
              <li className="lpv-pagination__item lpv-pagination__item--ellipsis" key={`ellipsis-${index}`}>
                …
              </li>
            ) : (
              <li
                className={`lpv-pagination__item${item.courant ? ' lpv-pagination__item--courant' : ''}`}
                key={item.numero}
              >
                <Link
                  aria-current={item.courant ? 'page' : undefined}
                  aria-label={`Page ${item.numero}`}
                  className="lpv-link lpv-pagination__lien"
                  href={item.href}
                >
                  {item.numero}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}

      {suivante && (
        <div className="lpv-pagination__suivant">
          <Link
            className="lpv-link lpv-pagination__lien"
            href={suivante.href}
            rel="next"
          >
            {variante === 'bloc' && suivante.libelle ? (
              <>
                <span className="lpv-pagination__lien-titre">
                  Suivant
                  {suivante.libelle && (
                    <>
                      <span className="lpv-visually-hidden"> :</span>
                      <span className="lpv-pagination__lien-libelle"> {suivante.libelle}</span>
                    </>
                  )}
                </span>
                <span aria-hidden="true" className="lpv-pagination__icone lpv-pagination__icone--suivant">
                  <Icon icone="rivet-icons:arrow-right" taille={16} />
                </span>
              </>
            ) : (
              <>
                Suivant
                <span aria-hidden="true" className="lpv-pagination__icone lpv-pagination__icone--suivant">
                  <Icon icone="rivet-icons:arrow-right" taille={16} />
                </span>
              </>
            )}
          </Link>
        </div>
      )}
    </nav>
  )
}