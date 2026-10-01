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

// Pastilles des jours hors mois : toutes en grisé (au lieu de leur catégorie).
const VARIABLES_HORS_MOIS = {
  '--marqueur-bg': 'var(--lpv-text-muted)',
  '--marqueur-texte': 'var(--lpv-surface)',
} as React.CSSProperties

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
  // La grille est construite depuis le 1er du mois : normalisation (les
  // appelants peuvent passer « new Date() », qui n'est pas forcément un 1er).
  const premierDuMois = new Date(mois.getFullYear(), mois.getMonth(), 1)
  const semaines = grilleMensuelle(premierDuMois)

  // Les cases « hors mois » (null dans la grille) deviennent les jours réels
  // du mois précédent / à venir (ils complètent la grille) : leur numéro
  // s'affiche, grisé, avec la classe --hors-mois.
  const caseVide = semaines.flat().findIndex((jour) => jour !== null)
  const nombreJours = new Date(mois.getFullYear(), mois.getMonth() + 1, 0).getDate()
  const cases = semaines.flat().map((jour, i) => {
    if (jour) return jour
    if (i < caseVide) return new Date(mois.getFullYear(), mois.getMonth(), i - caseVide + 1)
    return new Date(mois.getFullYear(), mois.getMonth() + 1, i - caseVide - nombreJours + 1)
  })
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

  // Légende : seulement les catégories effectivement portées par au moins un
  // marqueur daté dans la fenêtre affichée (les 42 cases de la grille, jours
  // hors mois compris). Une catégorie sans marqueur dans cette fenêtre n'y
  // figure pas, et la légende est omise si elle serait vide.
  const datesGrille = new Set(cases.map((jour) => jour.toDateString()))
  const categoriesLegende = categories.filter((categorie) =>
    marqueurs.some(
      (marqueur) =>
        marqueur.type === categorie.id && datesGrille.has(marqueur.date.toDateString()),
    ),
  )

  const aujourdhuiStr = new Date().toDateString()
  const debutDuJour = new Date()
  debutDuJour.setHours(0, 0, 0, 0)
  const detailOuvert = jourSelectionne ? new Date(jourSelectionne) : null
  const detailId = 'month-calendar-detail'

  // Couleurs du panneau de détail : celles, inversées, de la première
  // catégorie du jour sélectionné (fond carré prioritaire, sinon première
  // pastille) pour relier visuellement le panneau à sa pastille ; repli :
  // le magenta de l'association (défauts SCSS).
  const categoriesJour = detailOuvert ? parJour.get(detailOuvert.toDateString()) : undefined
  const categorieJour = categoriesJour?.find((c) => c.forme === 'carre') ?? categoriesJour?.[0]

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

      {/*<div aria-hidden="true" className="lpv-m-month-calendar__rule" />*/}

      <div className="lpv-m-month-calendar__grid" role="grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((jour, i) => (
          <div className="lpv-m-month-calendar__weekday" key={`w${i}`}>
            {jour}
          </div>
        ))}
        {cases.map((jour, i) => {
          const categoriesDuJour = parJour.get(jour.toDateString())
          const fondCarre = categoriesDuJour?.find((c) => c.forme === 'carre')
          const cle = jour.toDateString()
          const selectionne = jourSelectionne === cle
          const cliquable = Boolean(renduDetailJour)
          const estPasse = jour < debutDuJour
          const horsMois = jour.getMonth() !== premierDuMois.getMonth()
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
                  <span className={`lpv-m-month-calendar__event${horsMois ? ' lpv-m-month-calendar__event--hors-mois' : ''}`}>
                    {jourDuMois}
                  </span>
                ) : (
                  <span
                    className={`lpv-m-month-calendar__num${cle === aujourdhuiStr ? ' lpv-m-month-calendar__num--today' : ''}${estPasse ? ' lpv-m-month-calendar__num--passe' : ''}${horsMois ? ' lpv-m-month-calendar__num--hors-mois' : ''}`}
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
                        style={horsMois ? VARIABLES_HORS_MOIS : variablesCouleur(categorie.couleur)}
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
                  style={
                    fondCarre
                      ? horsMois
                        ? VARIABLES_HORS_MOIS
                        : variablesCouleur(fondCarre.couleur)
                      : undefined
                  }
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
                <span
                  className={`lpv-m-month-calendar__event${horsMois ? ' lpv-m-month-calendar__event--hors-mois' : ''}`}
                  style={horsMois ? VARIABLES_HORS_MOIS : variablesCouleur(fondCarre.couleur)}
                >
                  {jourDuMois}
                </span>
              ) : (
                <span
                  className={`lpv-m-month-calendar__num${cle === aujourdhuiStr ? ' lpv-m-month-calendar__num--today' : ''}${estPasse ? ' lpv-m-month-calendar__num--passe' : ''}${horsMois ? ' lpv-m-month-calendar__num--hors-mois' : ''}`}
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
                      style={horsMois ? VARIABLES_HORS_MOIS : variablesCouleur(categorie.couleur)}
                    />
                  ))}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {detailOuvert && renduDetailJour && (
        <div className="lpv-m-month-calendar__detail">
          <div
            className="lpv-m-month-calendar__detail__lpv-recap"
            id={detailId}
            style={categorieJour ? variablesCouleur(categorieJour.couleur) : undefined}
          >
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
        </div>
      )}

      {categoriesLegende.length > 0 && (
        <dl className="lpv-m-month-calendar__legend">
          {categoriesLegende.map((categorie) => (
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
      )}
    </div>
  )
}
