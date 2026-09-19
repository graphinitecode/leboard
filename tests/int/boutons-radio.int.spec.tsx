import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { BoutonsRadio } from '@/components/molecules/BoutonsRadio'
import type { OptionRadio } from '@/components/molecules/BoutonsRadio'

const options: OptionRadio[] = [
  { valeur: 'oui', texte: 'Oui' },
  { valeur: 'non', texte: 'Non' },
]

describe('BoutonsRadio', () => {
  it('affiche toutes les options', () => {
    render(<BoutonsRadio nom="test" options={options} idPrefix="test-radio" valeur="oui" />)
    expect(screen.getByLabelText('Oui')).toBeDefined()
    expect(screen.getByLabelText('Non')).toBeDefined()
  })

  it('affiche l\'option sélectionnée comme cochée', () => {
    render(<BoutonsRadio nom="test" options={options} idPrefix="test-radio" valeur="oui" />)
    expect(screen.getByLabelText('Oui')).toBeChecked()
    expect(screen.getByLabelText('Non')).not.toBeChecked()
  })

  it('affiche le contenu conditionnel quand l\'option est sélectionnée', () => {
    const optionsWithConditional: OptionRadio[] = [
      { valeur: 'oui', texte: 'Oui', conditionnel: <p>Précisez</p> },
      { valeur: 'non', texte: 'Non' },
    ]
    render(<BoutonsRadio nom="test" options={optionsWithConditional} idPrefix="test-radio" valeur="oui" />)
    const el = screen.getByText('Précisez')
    expect(el.closest('.lpv-radios__conditionnel')).not.toHaveClass('lpv-radios__conditionnel--hidden')
  })

  it('masque le contenu conditionnel quand l\'option n\'est pas sélectionnée', () => {
    const optionsWithConditional: OptionRadio[] = [
      { valeur: 'oui', texte: 'Oui', conditionnel: <p>Précisez</p> },
      { valeur: 'non', texte: 'Non' },
    ]
    const { container } = render(<BoutonsRadio nom="test" options={optionsWithConditional} idPrefix="test-radio" valeur="non" />)
    const conditionalDiv = container.querySelector('.lpv-radios__conditionnel')
    expect(conditionalDiv).toHaveClass('lpv-radios__conditionnel--hidden')
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<BoutonsRadio nom="test" options={options} idPrefix="test-radio" valeur="oui" erreur="Choisissez une option" />)
    expect(screen.getByText('Choisissez une option')).toBeDefined()
  })

  it('affiche un diviseur', () => {
    const optionsWithDivider: OptionRadio[] = [
      { valeur: 'oui', texte: 'Oui' },
      { diviseur: 'ou' },
      { valeur: 'non', texte: 'Non' },
    ]
    render(<BoutonsRadio nom="test" options={optionsWithDivider} idPrefix="test-radio" valeur="oui" />)
    expect(screen.getByText('ou')).toBeDefined()
  })
})