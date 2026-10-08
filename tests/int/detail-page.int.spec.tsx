import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DetailPage, DetailSection } from '@/components/templates/t-detail-page'

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

  it('aligne l’action de section à côté du titre', () => {
    render(
      <DetailPage
        backHref="/profs"
        backLabel="Retour"
        sections={[
          {
            title: 'Historique de présence',
            action: { download: true, href: '/export.csv', icon: 'rivet-icons:save', label: 'Exporter (CSV)' },
            children: <p>Tableau</p>,
          },
          { title: 'Progression', children: <p>Liste</p> },
        ]}
        title="Léa Martin"
      />,
    )
    const lien = screen.getByRole('link', { name: 'Exporter (CSV)' })
    expect(lien.getAttribute('href')).toBe('/export.csv')
    expect(lien.hasAttribute('download')).toBe(true)
    expect(lien.querySelector('svg')).not.toBeNull()
    const entete = lien.closest('.lpv-t-detail-page__section-header')
    expect(entete?.querySelector('h2')?.textContent).toBe('Historique de présence')
    expect(document.querySelectorAll('.lpv-t-detail-page__section-header')).toHaveLength(1)
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

  it('rend la caption sous le titre quand fournie', () => {
    render(
      <DetailPage
        backHref="/profs"
        backLabel="Retour"
        caption="CM2 · Groupe B — Prof référent : Claire D."
        sections={[]}
        title="Lucas M."
      />,
    )
    expect(screen.getByText(/Prof référent : Claire D./)).toBeDefined()
  })

  it('rend la grille de stats et la sidebar en deux colonnes', () => {
    const { container } = render(
      <DetailPage
        backHref="/profs"
        backLabel="Retour"
        sections={[{ title: 'Historique', children: <p>Contenu</p> }]}
        sidebar={<aside>Informations élève</aside>}
        stats={[
          { label: 'Taux de présence', value: '62%', type: 'alert' },
          { label: 'Alerte active', value: 1 },
        ]}
        title="Lucas M."
      />,
    )
    expect(container.querySelector('.lpv-cards-grid')).not.toBeNull()
    // Le titre est au-dessus de la grille : le rail débute au niveau des stats
    const main = container.querySelector('.lpv-t-rail__main')
    expect(main?.textContent).not.toContain('Lucas M.')
    expect(main?.firstElementChild?.classList.contains('lpv-cards-grid')).toBe(true)
    expect(screen.getByText('62%')).toBeDefined()
    expect(screen.getByText('Taux de présence')).toBeDefined()
    expect(screen.getByText('Informations élève')).toBeDefined()
  })
})