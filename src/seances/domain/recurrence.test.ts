import { describe, expect, it } from 'vitest'

import { dateParis, jourParis, minutesParis } from '@/shared/fuseau'

import {
  etatRecurrence,
  jourDuRang,
  libelleRegle,
  limiteGeneration,
  occurrences,
  rangDansMois,
} from './recurrence'

describe('dateParis', () => {
  it("garde l'heure de Paris de part et d'autre du changement d'heure", () => {
    // Heure d'été (UTC+2) puis heure d'hiver (UTC+1) : 14h reste 14h
    expect(dateParis({ annee: 2026, jour: 20, mois: 10 }, '14:00').toISOString()).toBe('2026-10-20T12:00:00.000Z')
    expect(dateParis({ annee: 2026, jour: 27, mois: 10 }, '14:00').toISOString()).toBe('2026-10-27T13:00:00.000Z')
  })

  it("relit le jour et l'heure de Paris d'un instant", () => {
    const instant = new Date('2026-10-27T13:00:00.000Z')
    expect(jourParis(instant)).toEqual({ annee: 2026, jour: 27, mois: 10 })
    expect(minutesParis(instant)).toBe(14 * 60)
  })
})

describe('occurrences hebdomadaires', () => {
  const regle = { fin: null, frequence: 'hebdomadaire' as const, premiere: '2026-10-06' }

  it('répète chaque semaine le même jour', () => {
    expect(occurrences(regle, '2026-10-01', '2026-10-27')).toEqual([
      '2026-10-06',
      '2026-10-13',
      '2026-10-20',
      '2026-10-27',
    ])
  })

  it('reprend après une date donnée et respecte la date de fin', () => {
    expect(occurrences({ ...regle, fin: '2026-10-21' }, '2026-10-14', '2026-12-31')).toEqual(['2026-10-20'])
  })
})

describe('occurrences mensuelles (même jour de semaine)', () => {
  it('suit le 2e mardi de chaque mois', () => {
    // 13 octobre 2026 : 2e mardi
    const regle = { fin: null, frequence: 'mensuelle' as const, premiere: '2026-10-13' }
    expect(occurrences(regle, '2026-10-01', '2027-01-31')).toEqual([
      '2026-10-13',
      '2026-11-10',
      '2026-12-08',
      '2027-01-12',
    ])
  })

  it('un 5e jour de semaine devient « le dernier » du mois', () => {
    // 29 octobre 2026 : 5e jeudi → dernier jeudi des mois suivants
    const regle = { fin: null, frequence: 'mensuelle' as const, premiere: '2026-10-29' }
    expect(occurrences(regle, '2026-10-01', '2026-12-31')).toEqual(['2026-10-29', '2026-11-26', '2026-12-31'])
  })
})

describe('rangs et libellés', () => {
  it('calcule le rang et retrouve le jour', () => {
    expect(rangDansMois({ annee: 2026, jour: 13, mois: 10 })).toBe(2)
    expect(jourDuRang(2026, 11, 1, 2)).toEqual({ annee: 2026, jour: 10, mois: 11 })
    expect(jourDuRang(2026, 11, 3, 5)).toEqual({ annee: 2026, jour: 26, mois: 11 })
  })

  it('décrit la règle', () => {
    expect(libelleRegle('hebdomadaire', '2026-10-06')).toBe('Chaque semaine le mardi')
    expect(libelleRegle('mensuelle', '2026-10-13')).toBe('Chaque mois le 2e mardi')
    expect(libelleRegle('mensuelle', '2026-10-06')).toBe('Chaque mois le 1er mardi')
    expect(libelleRegle('mensuelle', '2026-10-29')).toBe('Chaque mois le dernier jeudi')
  })
})

describe('horizon et état', () => {
  it('génère sur 3 mois glissants, ou jusqu’à la fin si elle est plus proche', () => {
    expect(limiteGeneration('2026-10-06', null)).toBe('2027-01-06')
    expect(limiteGeneration('2026-10-06', '2026-11-30')).toBe('2026-11-30')
    expect(limiteGeneration('2026-10-06', '2027-06-30')).toBe('2027-01-06')
  })

  it('distingue série continue et série bornée', () => {
    expect(etatRecurrence(null)).toBe('continue')
    expect(etatRecurrence('2027-06-30')).toBe('bornee')
  })
})
