'use client'

import Link from 'next/link'
import { useState } from 'react'

import { grilleMensuelle, libelleMoisTitre } from '@/calendrier/domain/calendrier.utils'
import type { CategorieMarqueurCalendrier, MarqueurJourCalendrier } from '@/calendrier/domain/calendrier.entity'

// Catégories par défaut : rétrocompatibilité (séance = point bleu,
// événement association = carré magenta).
export const CATEGORIES_DEFAUT: CategorieMarqueurCalendrier[] = [
  { couleur: 'blue', forme: 'point', id: 'seance', label: 'Séance programmée' },
  { couleur: 'magenta', forme: 'carre', id: 'evenement', label: 'Événement association' },
]

// Variables CSS de la catégorie : fond (bg du tag) + accent (texte du tag).
// Les tokens --lpv-a-tag--{c}-bg/-text sont redéfinis en dark mode.
function variablesCouleur(couleur: CategorieMarqueurCalendrier['couleur']): React.CSSProperties {
  return {
    '--marqueur-bg': `var(--lpv-a-tag--${couleur}-bg)`,
    '--marqueur-texte': `var(--lpv-a-tag--${couleur}-text)`,
  } as React.CSSProperties
}

// Molécule : carte calendrier mensuel avec légende (pattern GOV.UK).
// Les jours portent des marqueurs définis par des catégories dynamiques :
// couleur (palette tags) et forme (point ou carré) pilotées par `categories`.
// Un jour porte TOUTES ses pastilles : fond carré si au moins une catégorie
// « carré » (la première fournit le fond), puis un point rond par marqueur.
// Avec `renduDetailJour`, les jours marqués sont cliquables : le clic
// ouvre un panneau de détail entre la grille et la légende (re-clic = ferme).
// Le jour courant est inversé. Lien « Voir tout » optionnel.
export function MonthCalendarCard({
  mois,
  categories = CATEGORIES_DEFAUT,
  marqueurs = [],
  voirToutHref,
  voirToutLabel = 'Voir tout',
  renduDetailJour,
}: {
  mois: Date
  categories?: CategorieMarqueurCalendrier[]
  marqueurs?: MarqueurJourCalendrier[]
  voirToutHref?: string
  voirToutLabel?: string
  renduDetailJour?: (jour: Date) => React.ReactNode
}) {
  const semaines = grilleMensuelle(mois)
  const categorieParId = new Map(categories.map((c) => [c.id, c]))
  const [jourSelectionne, setJourSelectionne] = useState<string | null>(null)

  // Toutes les catégories présentes par jour, dans l'ordre de déclaration.
  const parJour = new Map<string, CategorieMarqueurCalendrier[]>()
  for (const marqueur of marqueurs) {
    const categorie = categorieParId.get(marqueur.type)
    if (!categorie) continue
    const cle = marqueur.date.toDateString()
    const existantes = parJour.get(cle)
    if (existantes) {
      if (!existantes.some((c) => c.id === categorie.id)) existantes.push(categorie)
    } else {
      parJour.set(cle, [categorie])
    }
  }

  const aujourdhuiStr = new Date().toDateString()
  const debutDuJour = new Date()
  debutDuJour.setHours(0, 0, 0, 0)
  const detailOuvert = jourSelectionne ? new Date(jourSelectionne) : null
  const detailId = 'month-calendar-detail'

  function basculerJour(jour: Date) {
    const cle = jour.toDateString()
    setJourSelectionne((actuel) => (actuel === cle ? null : cle))
  }

  return (
    <div className="lpv-m-month-calendar">
      <div className="lpv-m-month-calendar__head">
        <h3 className="lpv-m-month-calendar__title">{libelleMoisTitre(mois)}</h3>
        {voirToutHref && (
          <Link className="lpv-link-inline" href={voirToutHref}>
            {voirToutLabel}
          </Link>
        )}
      </div>

      <div aria-hidden="true" className="lpv-m-month-calendar__rule" />

      <div className="lpv-m-month-calendar__grid" role="grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((jour, i) => (
          <div className="lpv-m-month-calendar__weekday" key={`w${i}`}>
            {jour}
          </div>
        ))}
        {semaines.flat().map((jour, i) => {
          if (!jour) return <span key={i} />
          const categoriesDuJour = parJour.get(jour.toDateString())
          const fondCarre = categoriesDuJour?.find((c) => c.forme === 'carre')
          const cle = jour.toDateString()
          const selectionne = jourSelectionne === cle
          const cliquable = Boolean(renduDetailJour)
          const estPasse = jour < debutDuJour
          const libelleJour = jour.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
          const jourDuMois = jour.getDate()

          function corpsJour(): React.ReactNode {
            return (
              <>
                {fondCarre ? (
                  <span className="lpv-m-month-calendar__event">{jourDuMois}</span>
                ) : (
                  <span
                    className={`lpv-m-month-calendar__num${cle === aujourdhuiStr ? ' lpv-m-month-calendar__num--today' : ''}${estPasse ? ' lpv-m-month-calendar__num--passe' : ''}`}
                  >
                    {jourDuMois}
                  </span>
                )}
                {categoriesDuJour && (
                  <span aria-hidden="true" className="lpv-m-month-calendar__dots">
                    {categoriesDuJour.map((categorie) => (
                      <span
                        className="lpv-m-month-calendar__dot"
                        key={categorie.id}
                        style={variablesCouleur(categorie.couleur)}
                      />
                    ))}
                  </span>
                )}
              </>
            )
          }

          if (cliquable) {
            return (
              <div className="lpv-m-month-calendar__day" key={i}>
                <button
                  aria-controls={detailOuvert ? detailId : undefined}
                  aria-expanded={selectionne}
                  className={`lpv-m-month-calendar__toggle${selectionne ? ' lpv-m-month-calendar__toggle--selected' : ''}`}
                  onClick={() => basculerJour(jour)}
                  style={fondCarre ? variablesCouleur(fondCarre.couleur) : undefined}
                  title={libelleJour}
                  type="button"
                >
                  {corpsJour()}
                </button>
              </div>
            )
          }

          return (
            <div className="lpv-m-month-calendar__day" key={i}>
              {fondCarre ? (
                <span className="lpv-m-month-calendar__event" style={variablesCouleur(fondCarre.couleur)}>
                  {jourDuMois}
                </span>
              ) : (
                <span
                  className={`lpv-m-month-calendar__num${cle === aujourdhuiStr ? ' lpv-m-month-calendar__num--today' : ''}${estPasse ? ' lpv-m-month-calendar__num--passe' : ''}`}
                >
                  {jourDuMois}
                </span>
              )}
              {categoriesDuJour && (
                <span aria-hidden="true" className="lpv-m-month-calendar__dots">
                  {categoriesDuJour.map((categorie) => (
                    <span
                      className="lpv-m-month-calendar__dot"
                      key={categorie.id}
                      style={variablesCouleur(categorie.couleur)}
                    />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {detailOuvert && renduDetailJour && (
        <div className="lpv-m-month-calendar__detail" id={detailId}>
          <p className="lpv-m-month-calendar__detail-title">
            {detailOuvert.toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          {renduDetailJour(detailOuvert)}
        </div>
      )}

      <dl className="lpv-m-month-calendar__legend">
        {categories.map((categorie) => (
          <div className="lpv-m-month-calendar__legend-item" key={categorie.id}>
            <dt>
              <span
                aria-hidden="true"
                className={`lpv-m-month-calendar__legend-${categorie.forme === 'carre' ? 'square' : 'dot'}`}
                style={variablesCouleur(categorie.couleur)}
              />
              <span className="lpv-visually-hidden">
                {categorie.forme === 'carre' ? 'Carré : ' : 'Point : '}
              </span>
            </dt>
            <dd>{categorie.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}