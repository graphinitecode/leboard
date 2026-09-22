import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CharacterCount } from '@/components/molecules/m-character-count'

describe('CompteurCaracteres', () => {
  it('affiche le label et le champ', () => {
    render(<CharacterCount id="test-cc" name="test-cc" label="Description" limite={200} />)
    expect(screen.getByLabelText('Description')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
  })

  it('affiche le message de compteur initial', () => {
    render(<CharacterCount id="test-cc2" name="test-cc2" label="Description" limite={200} />)
    const compteurDiv = document.getElementById('test-cc2-compte')
    expect(compteurDiv).not.toBeNull()
    expect(compteurDiv?.textContent).toContain('200')
    expect(compteurDiv?.textContent).toContain('caractères')
  })

  it('affiche le compteur de mots quand type=mots', () => {
    render(<CharacterCount id="test-cc3" name="test-cc3" label="Résumé" limite={100} type="mots" />)
    const compteurDiv = document.getElementById('test-cc3-compte')
    expect(compteurDiv?.textContent).toContain('100')
    expect(compteurDiv?.textContent).toContain('mots')
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<CharacterCount id="test-cc4" name="test-cc4" label="Description" limite={200} erreur="Trop long" />)
    expect(screen.getByText('Trop long')).toBeDefined()
  })

  it('affiche le hint quand fourni', () => {
    render(<CharacterCount id="test-cc5" name="test-cc5" label="Description" limite={200} hint="Décrivez brièvement" />)
    expect(screen.getByText('Décrivez brièvement')).toBeDefined()
  })
})
