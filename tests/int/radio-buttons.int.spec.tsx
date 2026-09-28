import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Radios } from '@/components/molecules/m-radios'
import type { RadioOption } from '@/components/molecules/m-radios'

const options: RadioOption[] = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
]

describe('Radios', () => {
  it('affiche toutes les options', () => {
    render(<Radios name="test" options={options} idPrefix="test-radio" value="oui" />)
    expect(screen.getByLabelText('Oui')).toBeDefined()
    expect(screen.getByLabelText('Non')).toBeDefined()
  })

  it('affiche l\'option sélectionnée comme cochée', () => {
    render(<Radios name="test" options={options} idPrefix="test-radio" value="oui" />)
    expect(screen.getByLabelText('Oui')).toBeChecked()
    expect(screen.getByLabelText('Non')).not.toBeChecked()
  })

  it('affiche le contenu conditionnel quand l\'option est sélectionnée', () => {
    const optionsWithConditional: RadioOption[] = [
      { value: 'oui', label: 'Oui', conditional: <p>Précisez</p> },
      { value: 'non', label: 'Non' },
    ]
    render(<Radios name="test" options={optionsWithConditional} idPrefix="test-radio" value="oui" />)
    const el = screen.getByText('Précisez')
    expect(el.closest('.lpv-m-radios__conditional')).not.toHaveClass('lpv-m-radios__conditional--hidden')
  })

  it('masque le contenu conditionnel quand l\'option n\'est pas sélectionnée', () => {
    const optionsWithConditional: RadioOption[] = [
      { value: 'oui', label: 'Oui', conditional: <p>Précisez</p> },
      { value: 'non', label: 'Non' },
    ]
    const { container } = render(<Radios name="test" options={optionsWithConditional} idPrefix="test-radio" value="non" />)
    const conditionalDiv = container.querySelector('.lpv-m-radios__conditional')
    expect(conditionalDiv).toHaveClass('lpv-m-radios__conditional--hidden')
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<Radios name="test" options={options} idPrefix="test-radio" value="oui" error="Choisissez une option" />)
    expect(screen.getByText('Choisissez une option')).toBeDefined()
  })

  it('affiche un diviseur', () => {
    const optionsWithDivider: RadioOption[] = [
      { value: 'oui', label: 'Oui' },
      { divider: 'ou' },
      { value: 'non', label: 'Non' },
    ]
    render(<Radios name="test" options={optionsWithDivider} idPrefix="test-radio" value="oui" />)
    expect(screen.getByText('ou')).toBeDefined()
  })
})
