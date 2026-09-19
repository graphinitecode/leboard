import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CompteurCaracteres } from '@/components/molecules/CompteurCaracteres'

describe('CompteurCaracteres', () => {
  it('affiche le label et le champ', () => {
    render(<CompteurCaracteres id="test-cc" name="test-cc" label="Description" limite={200} />)
    expect(screen.getByLabelText('Description')).toBeDefined()
    expect(screen.getByText('Description')).toBeDefined()
  })

  it('affiche le message de compteur initial', () => {
    render(<CompteurCaracteres id="test-cc2" name="test-cc2" label="Description" limite={200} />)
    const compteurDiv = document.getElementById('test-cc2-compte')
    expect(compteurDiv).not.toBeNull()
    expect(compteurDiv?.textContent).toContain('200')
    expect(compteurDiv?.textContent).toContain('caractères')
  })

  it('affiche le compteur de mots quand type=mots', () => {
    render(<CompteurCaracteres id="test-cc3" name="test-cc3" label="Résumé" limite={100} type="mots" />)
    const compteurDiv = document.getElementById('test-cc3-compte')
    expect(compteurDiv?.textContent).toContain('100')
    expect(compteurDiv?.textContent).toContain('mots')
  })

  it('affiche une erreur quand le prop est fourni', () => {
    render(<CompteurCaracteres id="test-cc4" name="test-cc4" label="Description" limite={200} erreur="Trop long" />)
    expect(screen.getByText('Trop long')).toBeDefined()
  })

  it('affiche le hint quand fourni', () => {
    render(<CompteurCaracteres id="test-cc5" name="test-cc5" label="Description" limite={200} hint="Décrivez brièvement" />)
    expect(screen.getByText('Décrivez brièvement')).toBeDefined()
  })
})