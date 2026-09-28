import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DashboardPage } from '@/components/templates/t-dashboard-page'

describe('DashboardPage', () => {
  it('rend la grille de stats puis les sections', () => {
    const { container } = render(
      <DashboardPage
        sections={[
          { title: "Aujourd'hui", children: <p>2 séances.</p> },
          { title: 'Cette semaine', children: <p>8 séances.</p> },
        ]}
        stats={[
          { value: 2, label: "Séance(s) aujourd'hui" },
          { value: 8, label: 'Cette semaine', detail: 'dont 2', detailColor: 'var(--lpv-orange)' },
        ]}
      />,
    )
    expect(container.querySelector('.lpv-cards-grid')).not.toBeNull()
    expect(container.querySelectorAll('.lpv-stat')).toHaveLength(2)
    expect(screen.getByText("Séance(s) aujourd'hui")).toBeDefined()
    expect(screen.getByText('dont 2')).toBeDefined()
    expect(screen.getByText("Aujourd'hui")).toBeDefined()
    expect(screen.getByText('2 séances.')).toBeDefined()
    expect(container.querySelectorAll('.lpv-t-dashboard-page__section')).toHaveLength(2)
  })

  it('omet la grille quand aucune stat', () => {
    const { container } = render(
      <DashboardPage sections={[{ title: 'Séances', children: <p>Contenu</p> }]} />,
    )
    expect(container.querySelector('.lpv-cards-grid')).toBeNull()
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('rend le contenu vide de section quand fourni', () => {
    render(
      <DashboardPage
        sections={[{ title: "Aujourd'hui", empty: <p>Aucune séance aujourd&apos;hui.</p> }]}
      />,
    )
    expect(screen.getByText("Aucune séance aujourd'hui.")).toBeDefined()
  })

  it('rend la grille de 3 stats avec la variante dediee', () => {
    const { container } = render(
      <DashboardPage
        sections={[{ title: 'Sections', children: <p>Contenu</p> }]}
        stats={[
          { value: 3, label: 'Séances cette semaine' },
          { value: 2, label: 'Retours en attente', type: 'alert' },
          { value: 1, label: 'Alerte active', type: 'alert' },
        ]}
      />,
    )
    expect(container.querySelector('.lpv-cards-grid--3')).not.toBeNull()
    expect(container.querySelectorAll('.lpv-stat')).toHaveLength(3)
    expect(container.querySelectorAll('.lpv-stat.alert')).toHaveLength(2)
  })

  it('pose les sections et la sidebar en deux colonnes quand sidebar fournie', () => {
    const { container } = render(
      <DashboardPage
        sections={[{ title: 'À traiter', children: <p>2 retours.</p> }]}
        sidebar={<p>Sidebar contenu</p>}
      />,
    )
    expect(container.querySelector('.lpv-t-dashboard-page__columns')).not.toBeNull()
    expect(container.querySelector('.lpv-t-dashboard-page__main')).not.toBeNull()
    const aside = container.querySelector('.lpv-t-dashboard-page__aside')
    expect(aside?.textContent).toContain('Sidebar contenu')
    expect(screen.getByText('À traiter')).toBeDefined()
  })

  it('reste en une colonne sans sidebar', () => {
    const { container } = render(
      <DashboardPage sections={[{ title: 'Sections', children: <p>Contenu</p> }]} />,
    )
    expect(container.querySelector('.lpv-t-dashboard-page__columns')).toBeNull()
  })
})