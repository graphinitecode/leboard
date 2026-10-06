import { describe, expect, it } from 'vitest'

import { joursAvantRetour, statutPret, trierParRetour, type Pret } from './pret.entity'

const pret = (id: number, dateRetourPrevue: string | null): Pret => ({
  dateEmprunt: '2026-09-20T10:00:00.000Z',
  dateRetourEffective: null,
  dateRetourPrevue,
  eleveId: 1,
  eleveLabel: 'Lucas M.',
  exemplaireCode: `EX-${id}`,
  id,
  livreId: 12,
  livreLabel: 'Le Petit Prince',
})

// Mardi 6 octobre 2026, 10h
const maintenant = new Date(2026, 9, 6, 10)

describe('statutPret', () => {
  it('en retard dès le lendemain du retour prévu', () => {
    expect(statutPret(pret(1, new Date(2026, 9, 4, 0).toISOString()), maintenant)).toBe('retard')
  })

  it('à rendre bientôt du jour même jusqu’à 3 jours avant', () => {
    expect(statutPret(pret(1, new Date(2026, 9, 6, 0).toISOString()), maintenant)).toBe('bientot')
    expect(statutPret(pret(1, new Date(2026, 9, 9, 0).toISOString()), maintenant)).toBe('bientot')
  })

  it('dans les temps au-delà, ou sans date de retour', () => {
    expect(statutPret(pret(1, new Date(2026, 9, 10, 0).toISOString()), maintenant)).toBe('a-temps')
    expect(statutPret(pret(1, null), maintenant)).toBe('a-temps')
  })
})

describe('joursAvantRetour', () => {
  it('compte en jours du calendrier', () => {
    expect(joursAvantRetour(new Date(2026, 9, 6, 23).toISOString(), maintenant)).toBe(0)
    expect(joursAvantRetour(new Date(2026, 9, 8, 0).toISOString(), maintenant)).toBe(2)
    expect(joursAvantRetour(null, maintenant)).toBeNull()
  })
})

describe('trierParRetour', () => {
  it('classe du retour le plus urgent au plus lointain, sans date en dernier', () => {
    const tries = trierParRetour([
      pret(1, '2026-10-20T00:00:00.000Z'),
      pret(2, null),
      pret(3, '2026-10-01T00:00:00.000Z'),
    ])
    expect(tries.map((p) => p.id)).toEqual([3, 1, 2])
  })
})
