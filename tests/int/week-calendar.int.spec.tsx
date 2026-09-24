import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WeekCalendar } from '@/components/organisms/o-week-calendar'
import type { WeekCalendarEvent } from '@/components/organisms/o-week-calendar'
import type { BandeDispo } from '@/calendrier/domain/calendrier.entity'

const EVENTS: WeekCalendarEvent[] = [
  {
    id: 1,
    debut: new Date(2025, 8, 22, 14, 0),
    dureeMin: 60,
    matiere: 'maths',
    labelGroupe: 'Maths-3e',
    href: '/profs/seances/1',
  },
  {
    id: 2,
    debut: new Date(2025, 8, 24, 16, 0),
    dureeMin: 60,
    matiere: 'francais',
    labelGroupe: '6e',
    href: '',
  },
]

const DISPOS: BandeDispo[] = [{ jour: 'vendredi', heureDebut: '17:00', heureFin: '19:00' }]

describe('WeekCalendar (mode demo/parent)', () => {
  it('rend les entetes de jours et la navigation', () => {
    const { container } = render(<WeekCalendar mode="demo" />)
    expect(screen.getByText(/Semaine du/)).toBeDefined()
    expect(container.textContent).toContain('Lundi')
    expect(container.textContent).toContain('Samedi')
    expect(screen.getAllByRole('button', { name: 'Semaine précédente' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Semaine suivante' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Aujourd/ })).toBeDefined()
  })

  it('rend les pastilles avec matiere et groupe', () => {
    render(<WeekCalendar dispos={DISPOS} events={EVENTS} mode="demo" />)
    expect(screen.getByText('Maths')).toBeDefined()
    expect(screen.getByText('Maths-3e')).toBeDefined()
    expect(screen.getByText('Français')).toBeDefined()
    const lien = screen.getByText('Maths').closest('a')
    expect(linkElementHref(lien)).toBe('/profs/seances/1')
  })

  it('rend les bandes de disponibilite', () => {
    const { container } = render(<WeekCalendar dispos={DISPOS} events={EVENTS} mode="parent" />)
    expect(container.querySelectorAll('.lpv-o-week-calendar__dispo')).toHaveLength(1)
  })

  it('affiche le message semaine vide', () => {
    const { container } = render(<WeekCalendar events={[]} mode="parent" />)
    expect(container.textContent).toContain('Aucune séance cette semaine.')
  })

  it('ne rend pas les cases cliquables hors mode prof', () => {
    const { container } = render(<WeekCalendar events={EVENTS} mode="parent" />)
    expect(container.querySelectorAll('.lpv-o-week-calendar__slot')).toHaveLength(0)
  })

  it('la couleur de pastille suit la matiere', () => {
    const { container } = render(<WeekCalendar events={EVENTS} mode="parent" />)
    expect(container.querySelector('.lpv-o-week-calendar__event--blue')).not.toBeNull()
    expect(container.querySelector('.lpv-o-week-calendar__event--violet')).not.toBeNull()
  })
})

function linkElementHref(element: Element | null): string {
  return (element as HTMLAnchorElement | null)?.getAttribute('href') ?? ''
}