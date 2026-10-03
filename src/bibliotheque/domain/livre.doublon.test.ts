import { describe, expect, it } from 'vitest'

import { compacterIsbn, detecterDoublonCatalogue } from './livre.doublon'

const CATALOGUE = [
  { id: 1, titre: 'Le Petit Prince', auteur: 'A. de Saint-Exupéry', isbn: '9782070612758' },
  { id: 2, titre: 'Vendredi', auteur: 'Michel Tournier', isbn: null },
]

describe('compacterIsbn', () => {
  it('retire espaces et tirets', () => {
    expect(compacterIsbn('978-2-07 061 275 8')).toEqual('9782070612758')
  })

  it('gère les valeurs vides et nulles', () => {
    expect(compacterIsbn(null)).toEqual('')
    expect(compacterIsbn('')).toEqual('')
    expect(compacterIsbn(undefined)).toEqual('')
  })
})

describe('detecterDoublonCatalogue', () => {
  it('renvoie null si le titre de la saisie est vide', () => {
    expect(detecterDoublonCatalogue({ titre: '' }, CATALOGUE)).toBeNull()
    expect(detecterDoublonCatalogue({ titre: null }, CATALOGUE)).toBeNull()
    expect(detecterDoublonCatalogue({}, CATALOGUE)).toBeNull()
  })

  it('bloque un ISBN déjà référencé, même avec un autre titre saisi', () => {
    const doublon = detecterDoublonCatalogue(
      { isbn: '978-2-07 061 275 8', titre: 'Autre chose', auteur: 'X' },
      CATALOGUE,
    )
    expect(doublon?.gravite).toEqual('bloquant')
    expect(doublon?.idLivre).toEqual(1)
    expect(doublon?.message).toContain('déjà au catalogue (même ISBN)')
  })

  it('bloque même titre + auteur sans ISBN saisi (casse et accents ignorés)', () => {
    const doublon = detecterDoublonCatalogue(
      { titre: 'LE PETIT prince', auteur: 'a de saint-exupery' },
      CATALOGUE,
    )
    expect(doublon?.gravite).toEqual('bloquant')
    expect(doublon?.idLivre).toEqual(1)
    expect(doublon?.message).toContain('Le Petit Prince')
  })

  it('avertit sans bloquer : ISBN saisi différent, même titre + auteur', () => {
    const doublon = detecterDoublonCatalogue(
      { titre: 'Le Petit Prince', auteur: 'A. de Saint-Exupéry', isbn: '9781020345678' },
      CATALOGUE,
    )
    expect(doublon?.gravite).toEqual('avertissement')
    expect(doublon?.message).toContain('autre ISBN')
  })

  it('avertit sans bloquer : ISBN saisi alors que la fiche existante n en a pas', () => {
    const doublon = detecterDoublonCatalogue(
      { titre: 'Vendredi', auteur: 'Michel Tournier', isbn: '9782073745437' },
      CATALOGUE,
    )
    expect(doublon?.gravite).toEqual('avertissement')
    expect(doublon?.idLivre).toEqual(2)
  })

  it('ignore un livre sans rapport (auteur différent, titre différent)', () => {
    expect(
      detecterDoublonCatalogue({ titre: 'Robinson Crusoé', auteur: 'D. Defoe' }, CATALOGUE),
    ).toBeNull()
  })

  it('ignore un titre identique avec un auteur différent', () => {
    expect(
      detecterDoublonCatalogue({ titre: 'Le Petit Prince', auteur: 'Someone Else' }, CATALOGUE),
    ).toBeNull()
  })

  it('ignore la ponctuation et les apostrophes typographiques variées', () => {
    const catalogue = [
      { id: 3, titre: 'L\'École de la nuit', auteur: 'Murielle B.', isbn: null },
    ]
    const doublon = detecterDoublonCatalogue(
      { titre: 'l\'école de la nuit', auteur: 'murielle b' },
      catalogue,
    )
    expect(doublon?.gravite).toEqual('bloquant')
  })
})