import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SummaryList } from '@/components/molecules/m-lists'

describe('SummaryList', () => {
  it('affiche les cles et les valeurs', () => {
    render(
      <SummaryList
        items={[
          { key: 'Nom', value: 'Dupont' },
          { key: 'Prénom', value: 'Marie' },
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
          { key: 'Élève', value: 'Marie', actions: [<a href="#mod" key="m">Modifier</a>] },
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
            key: 'Créneau',
            value: 'Lundi 14h',
            actions: [
              <a href="#aj" key="a">Ajouter</a>,
              <a href="#mod" key="m">Modifier</a>,
              <a className="lpv-m-summary-list__action--danger" href="#sup" key="s">Supprimer</a>,
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText('Ajouter')).toBeDefined()
    expect(screen.getByText('Supprimer')).toBeDefined()
    const items = container.querySelectorAll('.lpv-m-summary-list__actions-list-item')
    expect(items).toHaveLength(3)
  })

  it('ne rend pas la colonne actions quand aucune action', () => {
    const { container } = render(<SummaryList items={[{ key: 'Nom', value: 'Dupont' }]} />)
    expect(container.querySelector('.lpv-m-summary-list__actions')).toBeNull()
    expect(container.querySelector('.lpv-m-summary-list__row--no-actions')).not.toBeNull()
  })

  it('rend les actions declaratives avec la classe du type', () => {
    const { container } = render(
      <SummaryList
        items={[
          {
            key: 'Créneau',
            value: 'Lundi 14h',
            actions: [
              { type: 'normal', label: 'Modifier', href: '#mod', key: 'mod' },
              { type: 'warning', label: 'Suspendre', href: '#sus', key: 'sus' },
              { type: 'danger', label: 'Supprimer', href: '#sup', key: 'sup' },
            ],
          },
        ]}
      />,
    )
    const liens = container.querySelectorAll('a')
    expect(liens[0]).toHaveClass('lpv-m-summary-list__action--normal')
    expect(liens[1]).toHaveClass('lpv-m-summary-list__action--warning')
    expect(liens[2]).toHaveClass('lpv-m-summary-list__action--danger')
    expect(screen.getByText('Suspendre')).toBeDefined()
  })

  it('rend un bouton pour une action sans href', () => {
    let clique = 0
    render(
      <SummaryList
        items={[
          {
            key: 'Créneau',
            value: 'Lundi 14h',
            actions: [{ type: 'danger', label: 'Supprimer', onClick: () => (clique += 1) }],
          },
        ]}
      />,
    )
    fireEvent.click(screen.getByText('Supprimer'))
    expect(clique).toBe(1)
  })

  it('desactive une action disabled', () => {
    render(
      <SummaryList
        items={[
          { key: 'Créneau', value: 'Lundi 14h', actions: [{ label: 'Supprimer', disabled: true }] },
        ]}
      />,
    )
    expect((screen.getByText('Supprimer') as HTMLButtonElement).disabled).toBe(true)
  })

  it('rend les actions JSX libres en melange avec les declaratives', () => {
    render(
      <SummaryList
        items={[
          {
            key: 'Créneau',
            value: 'Lundi 14h',
            actions: [
              <a href="#libre" key="libre">Action libre</a>,
              { label: 'Modifier', href: '#mod', key: 'mod' },
            ],
          },
        ]}
      />,
    )
    expect(screen.getByText('Action libre')).toBeDefined()
    expect(screen.getByText('Modifier')).toBeDefined()
  })
})