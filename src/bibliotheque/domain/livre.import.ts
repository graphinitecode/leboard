import { CATEGORIES_LIVRE, NIVEAUX_LIVRE, type OptionLivre } from './livre.options'
import { compacterIsbn, detecterDoublonCatalogue } from './livre.doublon'
import { normaliserTexte } from '@/shared/ui/normalize-text'

// Analyse d'un fichier CSV de livres à importer (page dédiée /livres/import).
// Format : titre ; auteur ; isbn ; niveau ; categorie ; exemplaires ; resume
// — l'ordre des colonnes n'importe PAS si une ligne d'en-tête (« titre » en
// première cellule) est présente : les colonnes sont reconnues par nom
// (insensible à la casse et aux accents). Sans en-tête, l'ordre positionnel
// ci-dessus fait foi. Le resume est facultatif, ainsi que isbn, niveau et
// categorie ; titre et auteur sont requis ; exemplaires vaut 1 par défaut.
//
// Tolérance des niveaux/catégories (choix du produit) : alias des années
// fines vers les paliers du domaine (CP → CP – CE2, 6ème → Collège…) et des
// étiquettes libres vers les catégories proches (Album jeunesse → Roman
// jeunesse, Contes classiques → Conte et fable). Une valeur non reconnue
// n'est PAS une erreur : le livre est importé sans cette information et
// marqué « à préciser sur la fiche ».

export interface LigneImportLivre {
  /** Niveau/catégorie non reconnu (texte présent) : importé sans, à préciser. */
  aPreciser: boolean
  auteur: string
  categorie: string
  categorieTexte: string
  erreurs: string[]
  exemplaires: number
  /** Position dans le fichier, en-tête comprise (pour relocaliser la ligne). */
  fichierLigne: number
  index: number
  isbn: string
  niveau: string
  niveauTexte: string
  resume: string
  titre: string
}

type LivreRef = {
  auteur?: null | string
  id: number
  isbn?: null | string
  titre: null | string
}

const CHAMPS = ['titre', 'auteur', 'isbn', 'niveau', 'categorie', 'exemplaires', 'resume'] as const
type Champ = (typeof CHAMPS)[number]

// Mapping positionnel (sans ligne d'en-tête).
const ORDRE_CHAMPS: Record<Champ, number> = {
  auteur: 1,
  categorie: 4,
  exemplaires: 5,
  isbn: 2,
  niveau: 3,
  resume: 6,
  titre: 0,
}

const MAX_EXEMPLAIRES = 50
const ISBN_REGLE = /^\d{10}$|^\d{13}$/

/** Règle de correspondance des en-têtes et des alias : casse, accents et ponctuation ignorés. */
const cleChamp = (texte: string): string => normaliserTexte(texte.trim()).replace(/[^a-z0-9]/g, '')

// Alias du domaine : clés normalisées → valeur de collection.
const ALIAS_NIVEAU: Record<string, string> = {
  '1ere': 'lycee',
  '1erelycee': 'lycee',
  '2nd': 'lycee',
  '2nde': 'lycee',
  '2ndelycee': 'lycee',
  '3e': 'college',
  '3eme': 'college',
  '4e': 'college',
  '4eme': 'college',
  '5e': 'college',
  '5eme': 'college',
  '6e': 'college',
  '6eme': 'college',
  ce1: 'cp-ce2',
  ce2: 'cp-ce2',
  cm1: 'cm1-cm2',
  cm1cm2: 'cm1-cm2',
  cm2: 'cm1-cm2',
  college: 'college',
  cp: 'cp-ce2',
  cpce2: 'cp-ce2',
  lycee: 'lycee',
  maternelle: 'maternelle',
  premiere: 'lycee',
  primaire: 'primaire',
  tale: 'lycee',
  terminale: 'lycee',
}

const ALIAS_CATEGORIE: Record<string, string> = {
  albumjeunesse: 'roman-jeunesse',
  autre: 'autre',
  bd: 'bande-dessinee',
  bandedessinee: 'bande-dessinee',
  conte: 'conte-fable',
  conteetfable: 'conte-fable',
  contefable: 'conte-fable',
  contes: 'conte-fable',
  contesclassiques: 'conte-fable',
  dictionnaire: 'dictionnaire',
  dictionnaireencyclopedie: 'dictionnaire',
  documentaire: 'documentaire',
  encyclopedie: 'dictionnaire',
  lecture: 'lecture',
  manuel: 'manuel',
  methodologie: 'methodologie',
  romanjeunesse: 'roman-jeunesse',
}

function valeurDepuisTexte(
  texte: string,
  options: OptionLivre[],
  alias: Record<string, string>,
): { reconnu: boolean; valeur: string } {
  const cle = cleChamp(texte)
  if (cle === '') return { reconnu: true, valeur: '' }
  const depuisAlias = alias[cle]
  if (depuisAlias) return { reconnu: true, valeur: depuisAlias }
  // Un futur ajout aux options (valeur ou libellé nouveau) est compris sans
  // toucher aux alias — le scan direct fait filet de sécurité.
  const directe = options.find((option) => cleChamp(option.value) === cle || cleChamp(option.label) === cle)
  if (directe) return { reconnu: true, valeur: directe.value }
  return { reconnu: false, valeur: '' }
}

/** Découpe CSV : séparateur détecté (; prioritaire pour les champs libres), champs quotés, retours à la ligne dans les guillemets. */
function decouperTableauCsv(texte: string): string[][] {
  const texteNet = texte.replace(/^\uFEFF/, '')
  const premiere = texteNet.split(/\r?\n/).find((ligne) => ligne.trim() !== '') ?? ''
  const separateur =
    (premiere.match(/;/g)?.length ?? 0) >= (premiere.match(/,/g)?.length ?? 0) ? ';' : ','

  const table: string[][] = []
  let ligne: string[] = []
  let champ = ''
  let entreGuillemets = false

  for (let i = 0; i < texteNet.length; i += 1) {
    const caractere = texteNet[i]
    if (entreGuillemets) {
      if (caractere === '"') {
        if (texteNet[i + 1] === '"') {
          champ += '"'
          i += 1
        } else {
          entreGuillemets = false
        }
      } else {
        champ += caractere
      }
      continue
    }
    if (caractere === '"') {
      entreGuillemets = true
    } else if (caractere === separateur) {
      ligne.push(champ)
      champ = ''
    } else if (caractere === '\n' || caractere === '\r') {
      if (caractere === '\r' && texteNet[i + 1] === '\n') i += 1
      ligne.push(champ)
      champ = ''
      if (ligne.some((cellule) => cellule.trim() !== '')) table.push(ligne)
      ligne = []
    } else {
      champ += caractere
    }
  }
  ligne.push(champ)
  if (ligne.some((cellule) => cellule.trim() !== '')) table.push(ligne)
  return table
}

function ligneDepuisChamps(
  brut: string[],
  lire: (brut: string[], champ: Champ) => string,
  fichierLigne: number,
  index: number,
  colonnesAttendues: number,
): LigneImportLivre {
  const titre = lire(brut, 'titre')
  const auteur = lire(brut, 'auteur')
  const isbn = compacterIsbn(lire(brut, 'isbn'))
  const niveauTexte = lire(brut, 'niveau')
  const categorieTexte = lire(brut, 'categorie')
  const resume = lire(brut, 'resume')
  const { valeur: niveau, reconnu: niveauReconnu } = valeurDepuisTexte(niveauTexte, NIVEAUX_LIVRE, ALIAS_NIVEAU)
  const { valeur: categorie, reconnu: categorieReconnu } = valeurDepuisTexte(
    categorieTexte,
    CATEGORIES_LIVRE,
    ALIAS_CATEGORIE,
  )

  const erreurs: string[] = []
  if (!titre) erreurs.push('titre manquant')
  if (!auteur) erreurs.push('auteur manquant')

  const exemplairesTexte = lire(brut, 'exemplaires')
  const nombre = exemplairesTexte === '' ? 1 : Number(exemplairesTexte)
  if (!Number.isInteger(nombre) || nombre < 1) erreurs.push("exemplaires : entier ≥ 1 attendu")
  else if (nombre > MAX_EXEMPLAIRES) erreurs.push(`exemplaires : ${MAX_EXEMPLAIRES} maximum par livre`)

  if (isbn && !ISBN_REGLE.test(isbn)) erreurs.push('isbn invalide (10 ou 13 chiffres attendus)')

  // Colonnes surnuméraires (hors cellules vides de fin, fréquentes dans les
  // exports) : la cause typique est un résumé contenant « ; » non quoté, qui
  // décale les valeurs (et faisait perdre les résumés).
  let utile = brut.length
  while (utile > 0 && brut[utile - 1].trim() === '') utile -= 1
  if (utile > colonnesAttendues) {
    erreurs.push('trop de colonnes — mettez le résumé entre guillemets s’il contient « ; »')
  }

  return {
    aPreciser: (!niveauReconnu && niveauTexte !== '') || (!categorieReconnu && categorieTexte !== ''),
    auteur,
    categorie,
    categorieTexte,
    erreurs,
    exemplaires: Number.isInteger(nombre) && nombre >= 1 ? nombre : 0,
    fichierLigne,
    index,
    isbn,
    niveau,
    niveauTexte,
    resume,
    titre,
  }
}

/** Analyse complète : lecture, mapping des colonnes, validation, doublons (fichier et catalogue). */
export function analyserImportLivre(
  texte: string,
  catalogue: LivreRef[],
): LigneImportLivre[] {
  const table = decouperTableauCsv(texte)
  const premier = table[0] ?? []

  // En-tête reconnue quand la première ligne nomme (au moins) deux champs —
  // quel que soit leur ordre ; sinon, lecture positionnelle de tout le fichier.
  const nomsReconnus = premier.filter((cellule) =>
    CHAMPS.includes(cleChamp(cellule) as Champ),
  ).length
  const avecEntete = nomsReconnus >= 2
  const indexes = new Map<Champ, number>()
  const colonnesAttendues = avecEntete ? premier.length : 7
  let lire: (brut: string[], champ: Champ) => string
  if (avecEntete) {
    premier.forEach((cellule, position) => {
      const champ = CHAMPS.find((nom) => cleChamp(nom) === cleChamp(cellule))
      if (champ && !indexes.has(champ)) indexes.set(champ, position)
    })
    lire = (brut, champ) => brut[indexes.get(champ) ?? -1]?.trim() ?? ''
  } else {
    lire = (brut, champ) => brut[ORDRE_CHAMPS[champ]]?.trim() ?? ''
  }

  const debutLignes = avecEntete ? 2 : 1
  const donnees = avecEntete ? table.slice(1) : table
  const lignes = donnees.map((brut, index) =>
    ligneDepuisChamps(brut, lire, debutLignes + index, index, colonnesAttendues),
  )

  // Doublons d'ISBN dans le fichier (2ᵉ occurrence refusée — même comportement
  // que la maquette) et doublons vs catalogue (garde serveur les refuserait).
  const isbnsVus = new Set<string>()
  for (const ligne of lignes) {
    if (ligne.isbn) {
      if (isbnsVus.has(ligne.isbn)) {
        ligne.erreurs.push('isbn en double dans le fichier')
      }
      isbnsVus.add(ligne.isbn)
    }
    const doublon = detecterDoublonCatalogue(
      { auteur: ligne.auteur, isbn: ligne.isbn, titre: ligne.titre },
      catalogue,
    )
    if (doublon?.gravite === 'bloquant') ligne.erreurs.push('déjà au catalogue')
  }

  return lignes
}