import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DetailPage, DetailSection } from '@/components/templates/t-portal-page'

describe('DetailPage', () => {
  it('rend le back link, le titre et les sections', () => {
    const { container } = render(
      <DetailPage
        backHref="/profs"
        backLabel="Tableau de bord"
        sections={[
          { title: 'Présences', children: <p>Historique des présences</p> },
          { title: 'Progressions', children: <p>Historique des progressions</p> },
        ]}
        title="Léa Martin"
      />,
    )
    expect(screen.getByText('Tableau de bord')).toBeDefined()
    expect(screen.getByText('Léa Martin')).toBeDefined()
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined()
    expect(screen.getByText('Présences')).toBeDefined()
    expect(screen.getByText('Historique des présences')).toBeDefined()
    expect(screen.getByText('Progressions')).toBeDefined()
    expect(container.querySelectorAll('h2')).toHaveLength(2)
  })

  it('rend le tag et la meta quand fournis', () => {
    render(
      <DetailPage
        backHref="/profs"
        backLabel="Retour"
        meta={<dl>Groupe : Maths-3e</dl>}
        sections={[]}
        tag={<span>4e</span>}
        title="Léa Martin"
      />,
    )
    expect(screen.getByText('4e')).toBeDefined()
    expect(screen.getByText('Groupe : Maths-3e')).toBeDefined()
  })

  it('rend le contenu de section via DetailSection', () => {
    render(
      <DetailSection title="Retours de séance">
        <p>Aucun retour.</p>
      </DetailSection>,
    )
    expect(screen.getByText('Retours de séance')).toBeDefined()
    expect(screen.getByText('Aucun retour.')).toBeDefined()
  })
})