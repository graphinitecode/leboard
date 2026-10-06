import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

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
    expect(container.textContent).toContain('Dimanche')
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
describe('WeekCalendar (vue jour)', () => {
  afterEach(() => {
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('navigue depuis le jour affiché, dimanche compris', async () => {
    // Mercredi 24 septembre 2025 : la vue jour s'ouvre sur ce jour
    vi.useFakeTimers({ now: new Date(2025, 8, 24, 10), shouldAdvanceTime: true })
    const user = userEvent.setup()
    const { container } = render(<WeekCalendar events={EVENTS} mode="parent" semaineInitiale={new Date(2025, 8, 22)} />)

    await user.click(screen.getByRole('button', { name: 'Vue jour' }))
    const navJour = () => within(container.querySelector('.lpv-o-week-calendar__day-nav') as HTMLElement)
    expect(navJour().getByText('Mercredi')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Jour suivant' }))
    expect(navJour().getByText('Jeudi')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Jour suivant' }))
    await user.click(screen.getByRole('button', { name: 'Jour suivant' }))
    await user.click(screen.getByRole('button', { name: 'Jour suivant' }))
    expect(navJour().getByText('Dimanche')).toBeDefined()

    // Dimanche 28 → lundi 29 : la semaine suit
    await user.click(screen.getByRole('button', { name: 'Jour suivant' }))
    expect(navJour().getByText('Lundi')).toBeDefined()
    expect(screen.getByText(/Semaine du 29 septembre/)).toBeDefined()
  })
})

describe('WeekCalendar (dimanche)', () => {
  it('affiche la colonne du dimanche et ses séances', () => {
    const dimanche: WeekCalendarEvent = {
      id: 9,
      debut: new Date(2025, 8, 28, 10, 0),
      dureeMin: 60,
      matiere: 'anglais',
      labelGroupe: 'Groupe du dimanche',
      href: '/profs/seances/9',
    }
    const { container } = render(<WeekCalendar events={[dimanche]} mode="parent" semaineInitiale={new Date(2025, 8, 22)} />)
    expect(container.textContent).toContain('Dimanche 28')
    expect(screen.getByText('Groupe du dimanche')).toBeDefined()
    expect(screen.getByText(/Semaine du 22 au 28 septembre/)).toBeDefined()
  })
})
