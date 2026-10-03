import { describe, expect, it } from 'vitest'

import { analyserImportLivre } from './livre.import'

const CATALOGUE = [
  { id: 100, titre: 'Le Petit Prince', auteur: 'A. de Saint-Exupéry', isbn: '9782070612758' },
]

describe('analyserImportLivre', () => {
  it('analyse un fichier à 6 colonnes sans résumé (en-tête comprise)', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires',
      'Matilda;Roald Dahl;9780141369372;CM1;Roman jeunesse;2',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes.length).toEqual(1)
    expect(lignes[0]).toMatchObject({
      auteur: 'Roald Dahl',
      categorie: 'roman-jeunesse',
      erreurs: [],
      exemplaires: 2,
      fichierLigne: 2,
      isbn: '9780141369372',
      niveau: 'cm1-cm2',
      resume: '',
      titre: 'Matilda',
      aPreciser: false,
    })
  })

  it('mappe les colonnes par nom, quel que soit leur ordre', () => {
    const csv = [
      'categorie;niveau;isbn;auteur;exemplaires;titre;resume',
      'Lecture;6ème;;Jeff Kinney;3;Le Journal d un dégonflé;Un résumé.;',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0]).toMatchObject({
      titre: 'Le Journal d un dégonflé',
      auteur: 'Jeff Kinney',
      niveau: 'college',
      categorie: 'lecture',
      exemplaires: 3,
      resume: 'Un résumé.',
      erreurs: [],
    })
  })

  it('lit un fichier sans en-tête en positionnel avec résumé', () => {
    const csv = 'Vendredi;Michel Tournier;9782070408401;Collège;Lecture;1;Un roman d’aventures.'

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes.length).toEqual(1)
    expect(lignes[0]).toMatchObject({
      titre: 'Vendredi',
      fichierLigne: 1,
      resume: 'Un roman d’aventures.',
      erreurs: [],
    })
  })

  it('lit un résumé quoté contenant des points-virgules', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      '"Un conte; en résumé";Collectif;;CP – CE2;Conte et fable;1;"Il y a des « ; » partout; vraiment."',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0].titre).toEqual('Un conte; en résumé')
    expect(lignes[0].resume).toEqual('Il y a des « ; » partout; vraiment.')
    expect(lignes[0].erreurs).toEqual([])
  })

  it('signale des colonnes surnuméraires (résumé non quoté avec ; )', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      'T;Auteur X;;CP – CE2;Lecture;1;Un résumé; avec point-virgule',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0].resume).toEqual('Un résumé')
    expect(lignes[0].erreurs).toContainEqual('trop de colonnes — mettez le résumé entre guillemets s’il contient « ; »')
  })

  it('gère le BOM et la position des lignes avec en-tête', () => {
    const csv = `\uFEFFtitre;auteur;isbn;niveau;categorie;exemplaires;resume
A;B;;CM1 – CM2;Lecture;1;
C;D;;CM1 – CM2;Lecture;;`

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes.length).toEqual(2)
    expect(lignes.map((ligne) => ligne.fichierLigne)).toEqual([2, 3])
    expect(lignes[1].exemplaires).toEqual(1)
  })

  it('exige titre et auteur', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      ';Auteur Y;;Collège;Lecture;1;',
      'Titre Z;;Collège;Lecture;1;',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0].erreurs).toContainEqual('titre manquant')
    expect(lignes[1].erreurs).toContainEqual('auteur manquant')
  })

  it('valide isbn et exemplaires', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      'A;B;978014;Collège;Lecture;1;',
      'C;D;;Collège;Lecture;0;',
      'E;F;;Collège;Lecture;3;',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0].erreurs).toContainEqual('isbn invalide (10 ou 13 chiffres attendus)')
    expect(lignes[1].erreurs).toContainEqual('exemplaires : entier ≥ 1 attendu')
    expect(lignes[2].exemplaires).toEqual(3)
  })

  it('mappe les années fines vers les paliers et les variantes vers les catégories', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      'A;B;;CP;Album jeunesse;1;',
      'C;D;;6ème;Contes classiques;1;',
      'E;F;;2nde (Lycée);Roman classique;1;',
      'G;H;;Terminale;Lecture;1;',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    expect(lignes[0].niveau).toEqual('cp-ce2')
    expect(lignes[0].categorie).toEqual('roman-jeunesse')
    expect(lignes[1].niveau).toEqual('college')
    expect(lignes[1].categorie).toEqual('conte-fable')
    expect(lignes[2].niveau).toEqual('lycee')
    expect(lignes[2].categorie).toEqual('') // jamais deviné à l'utilisateur
    expect(lignes[2].aPreciser).toBe(true)
    expect(lignes[2].erreurs).toEqual([])
    expect(lignes[3].niveau).toEqual('lycee')
    expect(lignes[3].aPreciser).toBe(false)
  })

  it('pré-signale isbn en double dans le fichier et doublon du catalogue', () => {
    const csv = [
      'titre;auteur;isbn;niveau;categorie;exemplaires;resume',
      'Le Petit Prince;A. de Saint-Exupéry;9782070612758;Collège;Lecture;1;',
      'Autre Livre;Auteur Z;9782070612758;Collège;Lecture;1;',
      'Encore Un;Auteur W;9782070612758;Collège;Lecture;1;',
    ].join('\n')

    const lignes = analyserImportLivre(csv, CATALOGUE)

    // Ligne 2 : ISBN = doublon du catalogue (Le Petit Prince, titre+auteur réels)
    expect(lignes[0].erreurs).toContainEqual('déjà au catalogue')
    // Ligne 3 : deuxième ISBN identique du fichier → en double + déjà au catalogue (même ISBN)
    expect(lignes[1].erreurs).toContainEqual('isbn en double dans le fichier')
    expect(lignes[1].erreurs).toContainEqual('déjà au catalogue')
    expect(lignes[2].erreurs).toContainEqual('isbn en double dans le fichier')
  })

  it('renvoie un tableau vide pour un fichier vide', () => {
    expect(analyserImportLivre('', CATALOGUE)).toEqual([])
    expect(analyserImportLivre('\n\n   \n', CATALOGUE)).toEqual([])
  })
})