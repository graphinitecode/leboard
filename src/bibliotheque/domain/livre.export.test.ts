import { describe, expect, it } from 'vitest'

import { versCsv } from '@/shared/csv'

import { lignesExportCatalogue } from './livre.export'
import { analyserImportLivre } from './livre.import'
import { CATEGORIES_LIVRE, NIVEAUX_LIVRE } from './livre.options'
import type { LivreCatalogue } from './pret.entity'

const livre = (id: number, titre: string, niveau: string | null, categorie: string | null, extra: Partial<LivreCatalogue> = {}): LivreCatalogue => ({
  archived: false,
  auteur: 'Roald Dahl',
  categorie,
  createdAt: '2026-09-01T00:00:00.000Z',
  editeur: null,
  exemplaires: [
    { code: `LPV-${id}a`, disponible: true, etat: 'bon', id: id * 10 },
    { code: `LPV-${id}b`, disponible: false, etat: 'bon', id: id * 10 + 1 },
  ],
  id,
  isbn: '9782070612758',
  niveau,
  resume: null,
  titre,
  ...extra,
})

describe('lignesExportCatalogue', () => {
  it("reprend l'en-tête de l'import, trie par titre et exclut les livres retirés", () => {
    const lignes = lignesExportCatalogue([
      livre(1, 'Matilda', 'cm1-cm2', 'roman-jeunesse'),
      livre(2, 'Charlie', 'college', 'lecture'),
      livre(3, 'Retiré', null, null, { archived: true }),
    ])
    expect(lignes[0]).toEqual(['titre', 'auteur', 'isbn', 'niveau', 'categorie', 'exemplaires', 'resume'])
    expect(lignes.slice(1).map((l) => l[0])).toEqual(['Charlie', 'Matilda'])
    expect(lignes[2]).toEqual(['Matilda', 'Roald Dahl', '9782070612758', 'CM1 – CM2', 'Roman jeunesse', '2', ''])
  })

  it("se réimporte tel quel : chaque niveau et chaque catégorie sont reconnus", () => {
    const livres = NIVEAUX_LIVRE.flatMap((niveau, i) =>
      CATEGORIES_LIVRE.map((categorie, j) =>
        livre(i * 100 + j, `Livre ${i}-${j}`, niveau.value, categorie.value, {
          isbn: null,
          resume: 'Un résumé ; avec un point-virgule et des "guillemets"',
        }),
      ),
    )
    const relues = analyserImportLivre(versCsv(lignesExportCatalogue(livres)), [])

    expect(relues).toHaveLength(livres.length)
    for (const ligne of relues) {
      const origine = livres.find((l) => l.titre === ligne.titre) as LivreCatalogue
      expect(ligne.erreurs).toEqual([])
      expect(ligne.niveau).toBe(origine.niveau)
      expect(ligne.categorie).toBe(origine.categorie)
      expect(ligne.exemplaires).toBe(2)
      expect(ligne.resume).toBe('Un résumé ; avec un point-virgule et des "guillemets"')
    }
  })
})
