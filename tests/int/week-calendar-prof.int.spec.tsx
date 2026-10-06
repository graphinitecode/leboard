import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WeekCalendar } from '@/components/organisms/o-week-calendar'
import type { WeekCalendarEvent } from '@/components/organisms/o-week-calendar'

const push = vi.fn()
const mutate = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh: vi.fn(), replace: vi.fn() }),
}))

const SEANCE: WeekCalendarEvent = {
  id: 7,
  debut: new Date(2025, 8, 22, 14, 0),
  dureeMin: 60,
  matiere: 'maths',
  labelGroupe: 'Maths-3e',
  href: '/profs/seances/7',
}

const SERIE_CONTINUE: WeekCalendarEvent = {
  ...SEANCE,
  debut: new Date(2025, 8, 23, 10, 0),
  id: 8,
  labelGroupe: 'Groupe continu',
  recurrence: 'continue',
}

const SERIE_BORNEE: WeekCalendarEvent = {
  ...SEANCE,
  debut: new Date(2025, 8, 24, 10, 0),
  id: 9,
  labelGroupe: 'Groupe borné',
  recurrence: 'bornee',
}

vi.mock('@/calendrier/application/calendrier.hooks', () => ({
  useDeplacerSeance: () => ({ isPending: false, mutate }),
  useSeancesPeriode: () => ({ data: [SEANCE, SERIE_CONTINUE, SERIE_BORNEE], isLoading: false }),
}))

// jsdom n'implémente pas la capture du pointeur
HTMLElement.prototype.setPointerCapture = vi.fn()

function caseDe(heure: string) {
  return screen.getByRole('button', { name: `Nouvelle séance le Lundi à ${heure}` })
}

describe('WeekCalendar (mode prof)', () => {
  beforeEach(() => {
    push.mockClear()
    mutate.mockClear()
    window.localStorage.setItem('lpv-calendrier-vue', 'semaine')
  })

  it("affiche l'horaire et la durée dans la pastille", () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    expect(screen.getByText('14:00 – 15:00 · 1 h')).toBeDefined()
  })

  it('un appui puis un relâchement sur une case ouvre la création préremplie', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    // clientY 0 : la rangée sous le pointeur est celle de 8h (colonne en haut à 0)
    fireEvent.pointerDown(caseDe('08:00'), { button: 0, clientY: 0, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerUp(caseDe('08:00'), { clientY: 60, pointerId: 1, pointerType: 'mouse' })
    expect(push).toHaveBeenCalledTimes(1)
    expect(push.mock.calls[0][0]).toContain('debut=08%3A00')
    expect(push.mock.calls[0][0]).toContain('fin=09%3A00')
  })

  it("un relâchement sans appui sur une case (fin d'un dépôt) n'ouvre pas la création", () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    fireEvent.pointerMove(caseDe('10:00'), { clientY: 200, pointerId: 1 })
    fireEvent.pointerUp(caseDe('10:00'), { clientY: 200, pointerId: 1 })
    expect(push).not.toHaveBeenCalled()
  })

  it('un glisser-déposer en cours empêche la sélection de démarrer', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    const pastille = screen.getByText('Maths-3e').closest('a') as HTMLElement
    fireEvent.dragStart(pastille, { dataTransfer: { setData: vi.fn(), effectAllowed: '' } })
    fireEvent.pointerDown(caseDe('16:00'), { button: 0, clientY: 352, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerUp(caseDe('16:00'), { clientY: 352, pointerId: 1, pointerType: 'mouse' })
    expect(push).not.toHaveBeenCalled()

    // Fin du glissement : la sélection redevient possible
    vi.useFakeTimers()
    fireEvent.dragEnd(pastille)
    vi.runAllTimers()
    vi.useRealTimers()
    fireEvent.pointerDown(caseDe('16:00'), { button: 0, clientY: 352, pointerId: 1, pointerType: 'mouse' })
    fireEvent.pointerUp(caseDe('16:00'), { clientY: 352, pointerId: 1, pointerType: 'mouse' })
    expect(push).toHaveBeenCalledTimes(1)
  })

  it('un dépôt qui finirait après 18h est refusé avec un message', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    const dataTransfer = { getData: () => '7' }
    fireEvent.drop(caseDe('17:30'), { dataTransfer })
    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText('Les cours se terminent au plus tard à 18h.')).toBeDefined()

    fireEvent.drop(caseDe('16:00'), { dataTransfer })
    expect(mutate).toHaveBeenCalledTimes(1)
  })

  it("l'icône de récurrence est colorée pour une série sans fin, atténuée sinon", () => {
    const { container } = render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    expect(container.querySelector('.lpv-o-week-calendar__event-recurrence--continue')).not.toBeNull()
    expect(container.querySelector('.lpv-o-week-calendar__event-recurrence--bornee')).not.toBeNull()
    expect(screen.getByRole('img', { name: 'Séance récurrente, sans fin' })).toBeDefined()
    // Séance ponctuelle : pas d'icône
    expect(container.querySelectorAll('.lpv-o-week-calendar__event-recurrence')).toHaveLength(2)
  })

  it('déplacer une séance récurrente demande la portée avant d’enregistrer', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    fireEvent.drop(screen.getByRole('button', { name: 'Nouvelle séance le Jeudi à 10:00' }), {
      dataTransfer: { getData: () => '8' },
    })
    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText('Modifier une séance récurrente')).toBeDefined()

    fireEvent.click(screen.getByLabelText('Cette séance et les suivantes'))
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({ portee: 'suivantes', seanceId: 8 })
  })

  it('déplacer une séance ponctuelle enregistre directement, sans portée', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    fireEvent.drop(caseDe('09:00'), { dataTransfer: { getData: () => '7' } })
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0].portee).toBeUndefined()
  })

  it('la poignée allonge la séance par pas de 30 min et enregistre la durée', () => {
    render(<WeekCalendar mode="prof" semaineInitiale={new Date(2025, 8, 22)} />)
    const pastille = screen.getByText('Maths-3e').closest('a') as HTMLElement
    const poignee = pastille.querySelector('.lpv-o-week-calendar__event-resize') as HTMLElement
    fireEvent.pointerDown(poignee, { button: 0, clientY: 100, pointerId: 2 })
    // 44 px = 30 min : +44 px → 1 h 30
    fireEvent.pointerMove(poignee, { clientY: 144, pointerId: 2 })
    expect(screen.getByText('14:00 – 15:30 · 1 h 30')).toBeDefined()
    fireEvent.pointerUp(poignee, { clientY: 144, pointerId: 2 })
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0][0]).toMatchObject({ seanceId: 7, dureeMin: 90 })
    expect(push).not.toHaveBeenCalled()
  })
})
