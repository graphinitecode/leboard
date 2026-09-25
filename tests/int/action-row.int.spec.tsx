import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ActionRow } from '@/components/molecules/m-action-row'

describe('ActionRow', () => {
  it('rend le titre, la meta et le bouton d action', () => {
    render(
      <ActionRow
        accent="red"
        action={{ href: '/profs/seances/1', label: 'Compléter', variant: 'success' }}
        meta="Lundi 22 septembre"
        tag={<TagStub />}
        title="Maths"
      />,
    )
    expect(screen.getByText('Maths')).toBeDefined()
    expect(screen.getByText('Lundi 22 septembre')).toBeDefined()
    expect(screen.getByText('Retour en attente')).toBeDefined()
    const lien = screen.getByText('Compléter').closest('a')
    expect((lien as HTMLAnchorElement | null)?.getAttribute('href')).toBe('/profs/seances/1')
  })

  it('applique la classe d accent rouge', () => {
    const { container } = render(<ActionRow accent="red" title="Français" />)
    expect(container.querySelector('.lpv-m-action-row--red')).not.toBeNull()
    expect(container.querySelector('.lpv-m-action-row--green')).toBeNull()
  })

  it('applique la classe d accent vert', () => {
    const { container } = render(<ActionRow accent="green" title="Anglais" />)
    expect(container.querySelector('.lpv-m-action-row--green')).not.toBeNull()
  })

  it('omet la meta et le bouton quand absents', () => {
    const { container } = render(<ActionRow title="Maths" />)
    expect(container.querySelector('.lpv-m-action-row__meta')).toBeNull()
    expect(container.querySelector('a')).toBeNull()
  })

  it('utilise la variante secondaire du bouton par defaut', () => {
    const { container } = render(
      <ActionRow action={{ href: '/voir', label: 'Voir' }} title="Maths" />,
    )
    expect(container.querySelector('.lpv-a-button--secondary')).not.toBeNull()
  })
})

function TagStub() {
  return <span>Retour en attente</span>
}