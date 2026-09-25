import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AlertCard } from '@/components/molecules/m-alert-card'

describe('AlertCard', () => {
  it('rend le titre, le message et le lien vers la fiche', () => {
    render(
      <AlertCard href="/profs/eleves/7" titre="Décrochage — Lucas M.">
        CM2 · Groupe B — 3 absences sur les 4 dernières séances
      </AlertCard>,
    )
    expect(screen.getByText('Décrochage — Lucas M.')).toBeDefined()
    expect(screen.getByText(/3 absences/)).toBeDefined()
    const lien = screen.getByText('Voir la fiche').closest('a')
    expect((lien as HTMLAnchorElement | null)?.getAttribute('href')).toBe('/profs/eleves/7')
  })

  it('omet le lien quand href est absent', () => {
    render(<AlertCard titre="Décrochage — Lucas M.">Message</AlertCard>)
    expect(screen.queryByText('Voir la fiche')).toBeNull()
  })

  it('utilise le libelle de lien fourni', () => {
    render(
      <AlertCard href="/profs/eleves/7" hrefLabel="Ouvrir" titre="Alerte">
        Message
      </AlertCard>,
    )
    expect(screen.getByText('Ouvrir')).toBeDefined()
  })
})