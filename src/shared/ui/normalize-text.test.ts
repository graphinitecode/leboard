import { describe, expect, it } from 'vitest'

import { normaliserTexte } from '@/shared/ui/normalize-text'

describe('normaliserTexte', () => {
  it('retire les accents et met en minuscule', () => {
    expect(normaliserTexte('Léa')).toBe('lea')
  })

  it('normalise les majuscules accentuées', () => {
    expect(normaliserTexte('ÀÉÎ')).toBe('aei')
  })

  it('renvoie une chaîne vide pour une entrée vide', () => {
    expect(normaliserTexte('')).toBe('')
  })

  it('laisse inchangé un texte déjà en ASCII minuscule', () => {
    expect(normaliserTexte('petit prince 123')).toBe('petit prince 123')
  })
})