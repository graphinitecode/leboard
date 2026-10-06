import { describe, expect, it } from 'vitest'

import { JOURS_SEMAINE, trierDisponibilites, validerHeures } from './disponibilite.entity'

describe('validerHeures', () => {
  it('accepte un créneau qui finit à 18h au plus tard', () => {
    expect(validerHeures('16:00', '18:00')).toBeNull()
  })

  it('refuse une fin après 18h', () => {
    expect(validerHeures('17:00', '18:30')).toBe('Les cours se terminent au plus tard à 18h.')
  })

  it('refuse une fin avant le début et un format invalide', () => {
    expect(validerHeures('15:00', '14:00')).toBe('L’heure de fin doit être après l’heure de début.')
    expect(validerHeures('9h', '10:00')).toBe('Les heures doivent être au format HH:mm.')
  })
})

describe('JOURS_SEMAINE', () => {
  it('inclut le dimanche et trie la semaine du lundi au dimanche', () => {
    expect(JOURS_SEMAINE.at(-1)).toBe('dimanche')
    const tries = trierDisponibilites([
      { heureDebut: '10:00', heureFin: '11:00', jour: 'dimanche' },
      { heureDebut: '10:00', heureFin: '11:00', jour: 'lundi' },
    ])
    expect(tries.map((d) => d.jour)).toEqual(['lundi', 'dimanche'])
  })
})
