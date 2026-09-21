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
// Deux modes : liste (numéros + previous/next alignés) et bloc (descriptif).
// La page courante est un bloc plein inversé (pas un lien) marqué
// aria-current="page" + texte caché « (page actuelle) ».
// En variante liste, « Précédent » disparaît en première page et
// « Suivant » en dernière page (ne pas passer les props correspondantes).
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
                <span aria-hidden="true" className="lpv-pagination__icone">
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
                <span aria-hidden="true" className="lpv-pagination__icone">
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
              <li aria-hidden="true" className="lpv-pagination__item lpv-pagination__item--ellipsis" key={`ellipsis-${index}`}>
                …
              </li>
            ) : item.courant ? (
              <li
                className="lpv-pagination__item"
                key={item.numero}
              >
                <strong
                  aria-current="page"
                  className="lpv-pagination__lien lpv-pagination__lien--courant"
                >
                  {item.numero}
                  <span className="lpv-visually-hidden"> (page actuelle)</span>
                </strong>
              </li>
            ) : (
              <li
                className="lpv-pagination__item"
                key={item.numero}
              >
                <Link
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
                <span aria-hidden="true" className="lpv-pagination__icone">
                  <Icon icone="rivet-icons:arrow-right" taille={16} />
                </span>
              </>
            ) : (
              <>
                Suivant
                <span aria-hidden="true" className="lpv-pagination__icone">
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
