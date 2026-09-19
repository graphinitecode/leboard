import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SummaryList } from '@/components/molecules/Listes'

describe('SummaryList', () => {
  it('affiche les cles et les valeurs', () => {
    render(
      <SummaryList
        items={[
          { cle: 'Nom', valeur: 'Dupont' },
          { cle: 'Prénom', valeur: 'Marie' },
        ]}
      />,
    )
    expect(screen.getByText('Nom')).toBeDefined()
    expect(screen.getByText('Dupont')).toBeDefined()
  })

  it('affiche une action par row', () => {
    render(
      <SummaryList
        items={[
          { cle: 'Élève', valeur: 'Marie', actions: [<a href="#mod" key="m">Modifier</a>] },
        ]}
      />,
    )
    expect(screen.getByText('Modifier')).toBeDefined()
  })

  it('affiche plusieurs actions separees par un trait vertical', () => {
    const { container } = render(
      <SummaryList
        items={[
          {
            cle: 'Créneau',
            valeur: 'Lundi 14h',
            actions: [
              <a href="#aj" key="a">Ajouter</a>,
              <a href="#mod" key="m">Modifier</a>,
              <a className="lpv-action--danger" href="#sup" key="s">Supprimer</a>,
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText('Ajouter')).toBeDefined()
    expect(screen.getByText('Supprimer')).toBeDefined()
    const items = container.querySelectorAll('.lpv-summary-list__actions-list-item')
    expect(items).toHaveLength(3)
  })

  it('ne rend pas la colonne actions quand aucune action', () => {
    const { container } = render(<SummaryList items={[{ cle: 'Nom', valeur: 'Dupont' }]} />)
    expect(container.querySelector('.lpv-summary-list__actions')).toBeNull()
    expect(container.querySelector('.lpv-summary-list__row--no-actions')).not.toBeNull()
  })
})