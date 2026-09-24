'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { debutSemaine } from '@/calendrier/domain/calendrier.utils'

// Organism : mini-calendrier mensuel de navigation.
// Chaque jour est un bouton : cliquer saute à la semaine (et au jour) du clic.
// Les jours de la semaine affichée sont surlignés ; les jours avec séances
// portent un point (dérivé des événements déjà chargés — aucune requête).
export function MonthPicker({
  lundi,
  onChoisirJour,
  joursOccupes,
}: {
  lundi: Date
  onChoisirJour: (jour: Date) => void
  joursOccupes: Date[]
}) {
  const [moisAffiche, setMoisAffiche] = useState(() => premierDuMois(lundi))

  const semaines = useMemo(() => grilleMensuelle(moisAffiche), [moisAffiche])
  const occupees = useMemo(() => new Set(joursOccupes.map((d) => d.toDateString())), [joursOccupes])
  const lundiStr = lundi.toDateString()

  return (
    <div className="lpv-o-month-picker">
      <div className="lpv-o-month-picker__head">
        <Button
          ariaLabel="Mois précédent"
          onClick={() => setMoisAffiche(premierDuMoisPrecedent(moisAffiche))}
          type="button"
          variant="secondary"
        >
          ‹
        </Button>
        <span className="lpv-o-month-picker__label" aria-live="polite">
          {libelleMois(moisAffiche)}
        </span>
        <Button
          ariaLabel="Mois suivant"
          onClick={() => setMoisAffiche(premierDuMoisSuivant(moisAffiche))}
          type="button"
          variant="secondary"
        >
          ›
        </Button>
      </div>
      <div className="lpv-o-month-picker__grid">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((jour, i) => (
          <div className="lpv-o-month-picker__weekday" key={`w${i}`}>
            {jour}
          </div>
        ))}
        {semaines.flat().map((jour, i) =>
          jour ? (
            <button
              aria-current={jour.toDateString() === new Date().toDateString() ? 'date' : undefined}
              className={`lpv-o-month-picker__day${debutSemaine(jour).toDateString() === lundiStr ? ' lpv-o-month-picker__day--active' : ''}`}
              key={i}
              onClick={() => onChoisirJour(jour)}
              title={jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              type="button"
            >
              <span>{jour.getDate()}</span>
              {occupees.has(jour.toDateString()) && (
                <span aria-hidden="true" className="lpv-o-month-picker__dot" />
              )}
            </button>
          ) : (
            <span className="lpv-o-month-picker__pad" key={i} />
          ),
        )}
      </div>
    </div>
  )
}

function premierDuMois(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function premierDuMoisPrecedent(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

function premierDuMoisSuivant(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}

// Grille du mois : 6 semaines × 7 cases, cases hors mois à null.
function grilleMensuelle(premier: Date): (Date | null)[][] {
  const cases: (Date | null)[] = []
  const decalage = (premier.getDay() + 6) % 7
  for (let i = 0; i < decalage; i += 1) cases.push(null)
  const fin = new Date(premier.getFullYear(), premier.getMonth() + 1, 0).getDate()
  for (let jour = 1; jour <= fin; jour += 1) {
    cases.push(new Date(premier.getFullYear(), premier.getMonth(), jour))
  }
  while (cases.length % 7 !== 0) cases.push(null)
  while (cases.length < 28) cases.push(null)

  const semaines: (Date | null)[][] = []
  for (let i = 0; i < cases.length; i += 7) semaines.push(cases.slice(i, i + 7))
  return semaines
}

function libelleMois(date: Date): string {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}