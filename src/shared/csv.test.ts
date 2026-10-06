import { describe, expect, it } from 'vitest'

import { nomFichierCsv, versCsv } from './csv'

describe('versCsv', () => {
  it('sépare par « ; », commence par le BOM et termine chaque ligne par CRLF', () => {
    expect(versCsv([['titre', 'auteur'], ['Matilda', 'Roald Dahl']])).toBe('﻿titre;auteur\r\nMatilda;Roald Dahl\r\n')
  })

  it('met entre guillemets les cellules qui contiennent « ; », un guillemet ou un retour à la ligne', () => {
    expect(versCsv([['a;b', 'il dit "non"', 'ligne\nsuivante', null, 3]])).toBe(
      '﻿"a;b";"il dit ""non""";"ligne\nsuivante";;3\r\n',
    )
  })
})

describe('nomFichierCsv', () => {
  it('date le nom du fichier', () => {
    expect(nomFichierCsv('catalogue', new Date(2026, 9, 6))).toBe('catalogue-2026-10-06.csv')
  })
})
