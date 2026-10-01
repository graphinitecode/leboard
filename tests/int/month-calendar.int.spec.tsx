import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MonthCalendarCard } from '@/components/molecules/m-month-calendar'
import type { CategorieMarqueurCalendrier, MarqueurJourCalendrier } from '@/calendrier/domain/calendrier.entity'

const JUIN_2026 = new Date(2026, 5, 1)

const CATEGORIES: CategorieMarqueurCalendrier[] = [
  { couleur: 'blue', forme: 'point', id: 'seance', label: 'Séance programmée' },
  { couleur: 'magenta', forme: 'carre', id: 'evenement', label: 'Événement association' },
]

const MARQUEURS: MarqueurJourCalendrier[] = [
  { type: 'seance', date: new Date(2026, 5, 2) },
  { type: 'seance', date: new Date(2026, 5, 4) },
  { type: 'evenement', date: new Date(2026, 5, 14) },
]

function renduDetail(jour: Date) {
  return <p>Detail du {jour.getDate()} juin</p>
}

describe('MonthCalendarCard', () => {
  it('rend le titre du mois, les entetes de jours et les dates', () => {
    const { container } = render(<MonthCalendarCard mois={JUIN_2026} />)
    expect(screen.getByText('juin 2026')).toBeDefined()
    expect(container.querySelectorAll('.lpv-m-month-calendar__weekday')).toHaveLength(7)
    // 42 cases (6 semaines) : 30 jours de juin + le 1er au 12 juillet ;
    // sans marqueurs passé, chaque case rend un numéro
    expect(container.querySelectorAll('.lpv-m-month-calendar__num')).toHaveLength(42)
    expect(container.querySelectorAll('.lpv-m-month-calendar__num--hors-mois')).toHaveLength(12)
    expect(screen.getByText('14')).toBeDefined()
  })

  it('rend le lien voir tout avec son href', () => {
    render(<MonthCalendarCard mois={JUIN_2026} voirToutHref="/profs" />)
    const lien = screen.getByText('Voir tout').closest('a')
    expect((lien as HTMLAnchorElement | null)?.getAttribute('href')).toBe('/profs')
  })

  it('omet le lien voir tout quand absent', () => {
    render(<MonthCalendarCard mois={JUIN_2026} />)
    expect(screen.queryByText('Voir tout')).toBeNull()
  })

  it('affiche un point par marqueur du jour (y compris les carres)', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={MARQUEURS} mois={JUIN_2026} />,
    )
    // 3 marqueurs = 3 pastilles rondes ; le jour 14 porte en plus le fond carre
    expect(container.querySelectorAll('.lpv-m-month-calendar__dot')).toHaveLength(3)
    expect(container.querySelectorAll('.lpv-m-month-calendar__event')).toHaveLength(1)
  })

  it('rend un marqueur carre pour la categorie carre, sans point', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={MARQUEURS} mois={JUIN_2026} />,
    )
    expect(container.querySelectorAll('.lpv-m-month-calendar__event')).toHaveLength(1)
    expect(container.querySelector('.lpv-m-month-calendar__event')?.textContent).toBe('14')
  })

  it('applique les couleurs de tag via variables inline', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={MARQUEURS} mois={JUIN_2026} />,
    )
    const event = container.querySelector('.lpv-m-month-calendar__event') as HTMLElement
    expect(event.style.getPropertyValue('--marqueur-bg')).toBe('var(--lpv-a-tag--magenta-bg)')
    expect(event.style.getPropertyValue('--marqueur-texte')).toBe('var(--lpv-a-tag--magenta-text)')
  })

  it('priorise le fond carre quand un jour porte plusieurs marqueurs, et rend toutes les pastilles', () => {
    const marqueurs: MarqueurJourCalendrier[] = [
      { type: 'seance', date: new Date(2026, 5, 18) },
      { type: 'evenement', date: new Date(2026, 5, 18) },
    ]
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={marqueurs} mois={JUIN_2026} />,
    )
    expect(container.querySelectorAll('.lpv-m-month-calendar__event')).toHaveLength(1)
    // une pastille par marqueur, meme avec fond carre
    expect(container.querySelectorAll('.lpv-m-month-calendar__dot')).toHaveLength(2)
  })

  it('deduplique les marqueurs de meme categorie sur un jour', () => {
    const marqueurs: MarqueurJourCalendrier[] = [
      { type: 'seance', date: new Date(2026, 5, 18) },
      { type: 'seance', date: new Date(2026, 5, 18) },
    ]
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={marqueurs} mois={JUIN_2026} />,
    )
    expect(container.querySelectorAll('.lpv-m-month-calendar__dot')).toHaveLength(1)
  })

  it('omet la legende quand la fenetre affichee ne porte aucun marqueur', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={[]} mois={JUIN_2026} />,
    )
    expect(screen.queryByText('Séance programmée')).toBeNull()
    expect(screen.queryByText('Événement association')).toBeNull()
    expect(container.querySelector('.lpv-m-month-calendar__legend')).toBeNull()
  })

  it('compte les marqueurs hors mois dans la legende (fenetre des 42 cases)', () => {
    const categories: CategorieMarqueurCalendrier[] = [
      { couleur: 'teal', forme: 'point', id: 'presence', label: 'Présence validée' },
    ]
    // le 3 juillet 2026 est un jour hors mois de la grille de juin (cases
    // complétées par les mois adjacents) ; il fait partie de la fenêtre
    const { container } = render(
      <MonthCalendarCard
        categories={categories}
        marqueurs={[{ type: 'presence', date: new Date(2026, 6, 3) }]}
        mois={JUIN_2026}
      />,
    )
    expect(screen.getByText('Présence validée')).toBeDefined()
    expect(container.querySelector('.lpv-m-month-calendar__legend-dot')).not.toBeNull()
  })

  it('rend la legende depuis les categories personnalisees', () => {
    const categories: CategorieMarqueurCalendrier[] = [
      { couleur: 'teal', forme: 'point', id: 'presence', label: 'Présence validée' },
      { couleur: 'yellow', forme: 'carre', id: 'sortie', label: 'Sortie pédagogique' },
    ]
    // chaque catégorie doit être portée par au moins un marqueur de la fenêtre
    const marqueurs: MarqueurJourCalendrier[] = [
      { type: 'presence', date: new Date(2026, 5, 5) },
      { type: 'sortie', date: new Date(2026, 5, 20) },
    ]
    const { container } = render(
      <MonthCalendarCard categories={categories} marqueurs={marqueurs} mois={JUIN_2026} />,
    )
    expect(screen.getByText('Présence validée')).toBeDefined()
    expect(screen.getByText('Sortie pédagogique')).toBeDefined()
    expect(screen.queryByText('Séance programmée')).toBeNull()
    expect(container.querySelector('.lpv-m-month-calendar__legend-dot')).not.toBeNull()
    expect(container.querySelector('.lpv-m-month-calendar__legend-square')).not.toBeNull()
  })

  it('utilise les categories par defaut quand categories est absent', () => {
    // MARQUEURS porte les deux catégories par défaut (2, 4 juin + 14 juin)
    render(<MonthCalendarCard marqueurs={MARQUEURS} mois={JUIN_2026} />)
    expect(screen.getByText('Séance programmée')).toBeDefined()
    expect(screen.getByText('Événement association')).toBeDefined()
  })

  it('ignore les marqueurs sans categorie correspondante', () => {
    const { container } = render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={[{ type: 'inconnu', date: new Date(2026, 5, 8) }]}
        mois={JUIN_2026}
      />,
    )
    expect(container.querySelectorAll('.lpv-m-month-calendar__dot')).toHaveLength(0)
    expect(container.querySelectorAll('.lpv-m-month-calendar__event')).toHaveLength(0)
  })

  it('affiche le detail du jour au clic sur un jour marque', () => {
    render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    expect(screen.queryByText(/Detail du 2 juin/)).toBeNull()
    fireEvent.click(screen.getByTitle('mardi 2 juin 2026'))
    expect(screen.getByText(/Detail du 2 juin/)).toBeDefined()
    expect(screen.getByText(/mardi 2 juin 2026/)).toBeDefined()
  })

  it('referme le detail au re-clic sur le meme jour', () => {
    render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    const jour = screen.getByTitle('mardi 2 juin 2026')
    fireEvent.click(jour)
    expect(screen.getByText(/Detail du 2 juin/)).toBeDefined()
    fireEvent.click(jour)
    expect(screen.queryByText(/Detail du 2 juin/)).toBeNull()
  })

  it('bascule le detail quand on clique sur un autre jour', () => {
    render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    fireEvent.click(screen.getByTitle('mardi 2 juin 2026'))
    fireEvent.click(screen.getByTitle('dimanche 14 juin 2026'))
    expect(screen.queryByText(/Detail du 2 juin/)).toBeNull()
    expect(screen.getByText(/Detail du 14 juin/)).toBeDefined()
  })

  it('rend les jours marques cliquables seulement avec renduDetailJour', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={MARQUEURS} mois={JUIN_2026} />,
    )
    expect(container.querySelectorAll('.lpv-m-month-calendar__toggle')).toHaveLength(0)
  })

  it('rend TOUS les jours cliquables quand renduDetailJour est fourni', () => {
    const { container } = render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    // 42 cases = 6 semaines, toutes cliquables (29 nums de juin + 12 nums de
    // juillet + 1 event pour le 14)
    expect(container.querySelectorAll('.lpv-m-month-calendar__toggle')).toHaveLength(42)
    expect(container.querySelectorAll('.lpv-m-month-calendar__num')).toHaveLength(41)
    expect(container.querySelectorAll('.lpv-m-month-calendar__event')).toHaveLength(1)
  })

  it('ouvre le detail d un jour sans marqueur (contenu vide explicite)', () => {
    render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    // le 8 juin n'a aucun marqueur
    fireEvent.click(screen.getByTitle('lundi 8 juin 2026'))
    expect(screen.getByText(/Detail du 8 juin/)).toBeDefined()
    expect(screen.getByText(/lundi 8 juin 2026/)).toBeDefined()
  })

  it('marque le jour courant avec la classe today et les jours anterieurs en passe', () => {
    const { container } = render(
      <MonthCalendarCard categories={CATEGORIES} marqueurs={MARQUEURS} mois={JUIN_2026} />,
    )
    // juin 2026 est entièrement passé : 29 numéros de juin portent --passe
    // (le 14 rend un event, pas un num), comme les 12 jours de juillet
    // (hors-mois), également antérieurs à aujourd'hui
    expect(container.querySelectorAll('.lpv-m-month-calendar__num--passe')).toHaveLength(41)
    expect(container.querySelectorAll('.lpv-m-month-calendar__num--hors-mois')).toHaveLength(12)
    // aucun jour du mois affiché n'est aujourd'hui
    expect(container.querySelectorAll('.lpv-m-month-calendar__num--today')).toHaveLength(0)
  })

  it('ne grise pas le jour courant quand le mois affiché contient aujourd hui', () => {
    const aujourdhui = new Date()
    const premierDuMois = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), 1)
    const { container } = render(<MonthCalendarCard mois={premierDuMois} />)
    const totalNum = container.querySelectorAll('.lpv-m-month-calendar__num').length
    expect(container.querySelectorAll('.lpv-m-month-calendar__num--today')).toHaveLength(1)
    // le jour courant n'a pas la classe passe, les jours suivants non plus ;
    // les cases hors mois du début (fin du mois précédent) sont passées
    // elles aussi
    const decalage = (premierDuMois.getDay() + 6) % 7
    const passes = container.querySelectorAll('.lpv-m-month-calendar__num--passe').length
    expect(passes).toBe(decalage + aujourdhui.getDate() - 1)
    expect(passes).toBeLessThan(totalNum)
  })

  it('accorde les couleurs du panneau de detail a la pastille du jour', () => {
    const { container } = render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    fireEvent.click(screen.getByTitle('mardi 2 juin 2026'))
    // le 2 juin porte une pastille seance (bleue) : couleurs du tag inversées
    const recap = container.querySelector(
      '.lpv-m-month-calendar__detail__lpv-recap',
    ) as HTMLElement | null
    expect(recap?.style.getPropertyValue('--marqueur-texte')).toBe('var(--lpv-a-tag--blue-text)')
    expect(recap?.style.getPropertyValue('--marqueur-bg')).toBe('var(--lpv-a-tag--blue-bg)')
  })

  it('expose aria-expanded sur les jours cliquables', () => {
    render(
      <MonthCalendarCard
        categories={CATEGORIES}
        marqueurs={MARQUEURS}
        mois={JUIN_2026}
        renduDetailJour={renduDetail}
      />,
    )
    const jour = screen.getByTitle('mardi 2 juin 2026')
    expect(jour.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(jour)
    expect(jour.getAttribute('aria-expanded')).toBe('true')
  })
})