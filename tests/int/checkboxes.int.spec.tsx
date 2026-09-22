import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '@/components/molecules/m-checkbox'
import type { OptionCase } from '@/components/molecules/m-checkbox'

const options: OptionCase[] = [
  { valeur: 'opt1', texte: 'Option un' },
  { valeur: 'opt2', texte: 'Option deux' },
  { valeur: 'opt3', texte: 'Option trois' },
]

describe('CasesACocher', () => {
  it('affiche toutes les options', () => {
    render(<Checkbox nom="test" options={options} idPrefix="test-cb" />)
    expect(screen.getByLabelText('Option un')).toBeDefined()
    expect(screen.getByLabelText('Option deux')).toBeDefined()
    expect(screen.getByLabelText('Option trois')).toBeDefined()
  })

  it('affiche un diviseur', () => {
    const optionsWithDivider: OptionCase[] = [
      { valeur: 'opt1', texte: 'Option un' },
      { diviseur: 'ou' },
      { valeur: 'opt2', texte: 'Option deux' },
    ]
    render(<Checkbox nom="test" options={optionsWithDivider} idPrefix="test-cb" />)
    expect(screen.getByText('ou')).toBeDefined()
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<Checkbox nom="test" options={options} idPrefix="test-cb" erreur="Choisissez au moins une option" />)
    expect(screen.getByText('Choisissez au moins une option')).toBeDefined()
  })

  it('affiche le contenu conditionnel au clic', () => {
    const optionsWithConditional: OptionCase[] = [
      { valeur: 'opt1', texte: 'Option un', conditionnel: <p>Détails supplémentaires</p> },
      { valeur: 'opt2', texte: 'Option deux' },
    ]
    render(<Checkbox nom="test" options={optionsWithConditional} idPrefix="test-cb" />)

    const checkbox = screen.getByLabelText('Option un')
    fireEvent.click(checkbox)

    expect(screen.getByText('Détails supplémentaires')).toBeDefined()
  })

  it('affiche le hint pour une option', () => {
    const optionsWithHint: OptionCase[] = [
      { valeur: 'opt1', texte: 'Option un', hint: 'Aide pour un' },
      { valeur: 'opt2', texte: 'Option deux' },
    ]
    render(<Checkbox nom="test" options={optionsWithHint} idPrefix="test-cb" />)
    expect(screen.getByText('Aide pour un')).toBeDefined()
  })
})
