import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '@/components/molecules/m-checkbox'
import type { CheckboxOption } from '@/components/molecules/m-checkbox'

const options: CheckboxOption[] = [
  { value: 'opt1', label: 'Option un' },
  { value: 'opt2', label: 'Option deux' },
  { value: 'opt3', label: 'Option trois' },
]

describe('Checkbox', () => {
  it('affiche toutes les options', () => {
    render(<Checkbox name="test" options={options} idPrefix="test-cb" />)
    expect(screen.getByLabelText('Option un')).toBeDefined()
    expect(screen.getByLabelText('Option deux')).toBeDefined()
    expect(screen.getByLabelText('Option trois')).toBeDefined()
  })

  it('affiche un diviseur', () => {
    const optionsWithDivider: CheckboxOption[] = [
      { value: 'opt1', label: 'Option un' },
      { divider: 'ou' },
      { value: 'opt2', label: 'Option deux' },
    ]
    render(<Checkbox name="test" options={optionsWithDivider} idPrefix="test-cb" />)
    expect(screen.getByText('ou')).toBeDefined()
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<Checkbox name="test" options={options} idPrefix="test-cb" error="Choisissez au moins une option" />)
    expect(screen.getByText('Choisissez au moins une option')).toBeDefined()
  })

  it('affiche le contenu conditionnel au clic', () => {
    const optionsWithConditional: CheckboxOption[] = [
      { value: 'opt1', label: 'Option un', conditional: <p>Détails supplémentaires</p> },
      { value: 'opt2', label: 'Option deux' },
    ]
    render(<Checkbox name="test" options={optionsWithConditional} idPrefix="test-cb" />)

    const checkbox = screen.getByLabelText('Option un')
    fireEvent.click(checkbox)

    expect(screen.getByText('Détails supplémentaires')).toBeDefined()
  })

  it('affiche le hint pour une option', () => {
    const optionsWithHint: CheckboxOption[] = [
      { value: 'opt1', label: 'Option un', hint: 'Aide pour un' },
      { value: 'opt2', label: 'Option deux' },
    ]
    render(<Checkbox name="test" options={optionsWithHint} idPrefix="test-cb" />)
    expect(screen.getByText('Aide pour un')).toBeDefined()
  })
})
