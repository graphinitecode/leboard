'use client'

import { useState } from 'react'

import { Button, Details, FileUpload, InsetText, Panel, Tag } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { ErrorSummary, Input, Table } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { QuestionPage } from '@/components/templates'
import {
  CATEGORIES_LIVRE,
  NIVEAUX_LIVRE,
  useCreerExemplaire,
  useCreerLivre,
  useListCatalogue,
} from '@/bibliotheque'

const ISBN_REGEX = /^\d{10}$|^\d{13}$/

// Page « Ajouter un livre » (maquette examples/add-livre-form.html) :
// formulaire simple d'une page, encart d'import CSV pour référencer
// plusieurs ouvrages d'un coup, succès en panneau (plus de wizard 3 étapes).
// Conformités maquette : titre + auteur requis, nombre d'exemplaires ≥ 1
// (chaque exemplaire = un POST, code LPV-xxxx auto-généré côté Payload),
// résumé facultatif, lien « Plusieurs livres ? Importer un fichier CSV ».

// Retire accents et espaces superflus (comparaison des listes déroulantes).
const normaliser = (valeur: string): string =>
  valeur
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')

const compactIsbn = (valeur: string): string => valeur.replace(/[\s-]/g, '')

// Parse CSV minimal : séparateur détecté sur la première ligne utile
// (; prioritaire en cas d'égalité), champs entre guillemets supportés
// ("…" et "" → guillemet littéral). Une ligne sans aucune cellule est ignorée.
function parserCsv(texte: string): string[][] {
  const premiere = texte.split(/\r?\n/).find((ligne) => ligne.trim() !== '') ?? ''
  const separateur =
    (premiere.match(/;/g)?.length ?? 0) >= (premiere.match(/,/g)?.length ?? 0) ? ';' : ','

  const table: string[][] = []
  let ligne: string[] = []
  let champ = ''
  let entreGuillemets = false

  for (let i = 0; i < texte.length; i += 1) {
    const c = texte[i]
    if (entreGuillemets) {
      if (c === '"') {
        if (texte[i + 1] === '"') {
          champ += '"'
          i += 1
        } else {
          entreGuillemets = false
        }
      } else {
        champ += c
      }
      continue
    }
    if (c === '"') {
      entreGuillemets = true
    } else if (c === separateur) {
      ligne.push(champ)
      champ = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texte[i + 1] === '\n') i += 1
      ligne.push(champ)
      champ = ''
      if (ligne.some((cellule) => cellule.trim() !== '')) table.push(ligne)
      ligne = []
    } else {
      champ += c
    }
  }
  ligne.push(champ)
  if (ligne.some((cellule) => cellule.trim() !== '')) table.push(ligne)
  return table
}

type LigneCsv = {
  index: number
  titre: string
  auteur: string
  isbn: string
  niveau: string
  categorie: string
  exemplaires: number
  resume: string
  erreurs: string[]
  statut: 'attente' | 'importe' | 'echec'
  motifEchec?: string
}

// Colonnes attendues : titre ; auteur ; isbn ; niveau ; categorie ;
// exemplaires ; resume — valeur vide → '', exemplaires absent → 1.
function ligneDepuisBrut(index: number, brut: string[]): LigneCsv {
  const [titre = '', auteur = '', isbn = '', niveau = '', categorie = '', exemplaires = '', resume = ''] = brut

  const erreurs: string[] = []
  if (!titre.trim()) erreurs.push('titre manquant')

  let niveauValeur = ''
  if (niveau.trim()) {
    niveauValeur =
      NIVEAUX_LIVRE.find(
        (n) => normaliser(n.value) === normaliser(niveau) || normaliser(n.label) === normaliser(niveau),
      )?.value ?? ''
    if (!niveauValeur) erreurs.push('niveau inconnu')
  }

  let categorieValeur = ''
  if (categorie.trim()) {
    categorieValeur =
      CATEGORIES_LIVRE.find(
        (c) => normaliser(c.value) === normaliser(categorie) || normaliser(c.label) === normaliser(categorie),
      )?.value ?? ''
    if (!categorieValeur) erreurs.push('catégorie inconnue')
  }

  const nombre = exemplaires.trim() === '' ? 1 : Number(exemplaires.trim())
  if (!Number.isInteger(nombre) || nombre < 1) erreurs.push('exemplaires : entier ≥ 1 attendu')
  else if (nombre > 50) erreurs.push('exemplaires : 50 maximum par livre')

  const isbnCompact = compactIsbn(isbn)
  if (isbnCompact && !ISBN_REGEX.test(isbnCompact)) {
    erreurs.push('isbn invalide (10 ou 13 chiffres attendus)')
  }

  return {
    auteur: auteur.trim(),
    categorie: categorieValeur,
    erreurs,
    exemplaires: Number.isInteger(nombre) && nombre >= 1 ? nombre : 0,
    index,
    isbn: isbnCompact,
    niveau: niveauValeur,
    resume: resume.trim(),
    titre: titre.trim(),
    statut: 'attente',
  }
}

export default function NouveauLivreView() {
  const catalogue = useListCatalogue()
  const creer = useCreerLivre()
  const creerExemplaire = useCreerExemplaire()

  const [isbn, setIsbn] = useState('')
  const [isbnEtat, setIsbnEtat] = useState<{
    variante: 'doublon' | 'invalide' | 'introuvable'
    texte: string
    ficheHref?: string
  } | null>(null)
  const [titre, setTitre] = useState('')
  const [auteur, setAuteur] = useState('')
  const [niveau, setNiveau] = useState('')
  const [categorie, setCategorie] = useState('')
  const [exemplaires, setExemplaires] = useState('1')
  const [resume, setResume] = useState('')
  const [erreurs, setErreurs] = useState<(string | { fieldId: string; text: string })[]>([])
  const [pending, setPending] = useState(false)
  const [succes, setSucces] = useState<string | null>(null)

  const [lignesCsv, setLignesCsv] = useState<LigneCsv[]>([])
  const [resultatImport, setResultatImport] = useState<{
    importes: number
    echecs: { titre: string; motif: string }[]
  } | null>(null)

  const lignesValides = lignesCsv.filter((ligne) => ligne.erreurs.length === 0 && ligne.statut === 'attente')

  // ISBN d'un ouvrage déjà référencé : doublon prévenu (orange) plutôt que
  // pré-rempli — créer un doublon serait une erreur de fond. Pas d'autre
  // base ISBN : ouvrage inconnu → saisie manuelle (info bleue).
  function rechercherIsbn() {
    const compact = compactIsbn(isbn)
    if (!ISBN_REGEX.test(compact)) {
      setIsbnEtat({
        texte: "L'ISBN doit contenir 10 ou 13 chiffres",
        variante: 'invalide',
      })
      return
    }
    const existant = (catalogue.data ?? []).find(
      (livre) => compactIsbn(livre.isbn ?? '') === compact,
    )
    if (existant) {
      setIsbnEtat({
        ficheHref: `/profs/bibliotheque/livres/${existant.id}`,
        texte: `« ${existant.titre} » est déjà au catalogue`,
        variante: 'doublon',
      })
      return
    }
    setIsbnEtat({
      texte: 'Aucun livre trouvé pour cet ISBN. Saisis les informations à la main.',
      variante: 'introuvable',
    })
  }

  function lireFichierCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const fichier = event.target.files?.[0]
    if (!fichier) return
    const lecteur = new FileReader()
    lecteur.onload = () => {
      let table = parserCsv(String(lecteur.result ?? ''))
      // Ligne d'en-tête : sautée si la première cellule vaut « titre ».
      if (table.length > 0 && normaliser(table[0][0] ?? '') === 'titre') table = table.slice(1)
      setLignesCsv(table.map((brut, index) => ligneDepuisBrut(index, brut)))
      setResultatImport(null)
      setIsbnEtat(null)
    }
    lecteur.readAsText(fichier, 'utf-8')
  }

  async function importerCsv() {
    const candidats = lignesCsv.filter(
      (ligne) => ligne.erreurs.length === 0 && ligne.statut === 'attente',
    )
    if (candidats.length === 0 || pending) return
    setErreurs([])
    setPending(true)
    const importes: string[] = []
    const echecs: { motif: string; titre: string }[] = []
    try {
      for (const ligne of candidats) {
        try {
          const id = await creer.mutateAsync({
            auteur: ligne.auteur || undefined,
            categorie: ligne.categorie || undefined,
            isbn: ligne.isbn || undefined,
            niveau: ligne.niveau || undefined,
            resume: ligne.resume || undefined,
            titre: ligne.titre,
          })
          for (let i = 0; i < ligne.exemplaires; i += 1) {
            await creerExemplaire.mutateAsync({ livre: id })
          }
          importes.push(ligne.titre)
          setLignesCsv((prev) =>
            prev.map((l) => (l.index === ligne.index ? { ...l, statut: 'importe' } : l)),
          )
        } catch (err) {
          const motif = err instanceof Error ? err.message : 'Le livre n’a pas pu être créé.'
          echecs.push({ motif, titre: ligne.titre })
          setLignesCsv((prev) =>
            prev.map((l) =>
              l.index === ligne.index ? { ...l, motifEchec: motif, statut: 'echec' } : l,
            ),
          )
        }
      }
    } finally {
      setPending(false)
    }
    setResultatImport({ echecs, importes: importes.length })
    if (importes.length > 0) {
      window.scrollTo({ top: 0 })
    }
  }

  async function enregistrerLivre() {
    const problemes: { fieldId: string; text: string }[] = []
    if (!titre.trim()) problemes.push({ fieldId: 'livre-titre', text: 'Saisis le titre du livre' })
    if (!auteur.trim()) problemes.push({ fieldId: 'livre-auteur', text: "Saisis l'auteur du livre" })
    const nombre = Number(exemplaires)
    if (!Number.isInteger(nombre) || nombre < 1) {
      problemes.push({
        fieldId: 'livre-exemplaires',
        text: "Saisis le nombre d'exemplaires (1 minimum)",
      })
    }
    const isbnCompact = compactIsbn(isbn)
    if (isbnCompact && !ISBN_REGEX.test(isbnCompact)) {
      problemes.push({ fieldId: 'livre-isbn', text: 'Corrige l\'ISBN (10 ou 13 chiffres attendus)' })
    }
    setErreurs(problemes)
    if (problemes.length > 0) {
      window.scrollTo({ top: 0 })
      return
    }

    setPending(true)
    try {
      const id = await creer.mutateAsync({
        auteur: auteur.trim() || undefined,
        categorie: categorie || undefined,
        isbn: isbnCompact || undefined,
        niveau: niveau || undefined,
        resume: resume.trim() || undefined,
        titre: titre.trim(),
      })
      for (let i = 0; i < nombre; i += 1) {
        await creerExemplaire.mutateAsync({ livre: id })
      }
      setSucces(
        `« ${titre.trim()} »${auteur.trim() ? ` de ${auteur.trim()}` : ''} — ${nombre} exemplaire${nombre > 1 ? 's' : ''}`,
      )
      // Rafraîchit la liste du catalogue pour l'existence d'une autre vue ouverte.
      window.scrollTo({ top: 0 })
    } catch (err) {
      setErreurs([err instanceof Error ? err.message : 'Le livre n’a pas pu être créé.'])
    } finally {
      setPending(false)
    }
  }

  function reinitialiser() {
    setIsbn('')
    setIsbnEtat(null)
    setTitre('')
    setAuteur('')
    setNiveau('')
    setCategorie('')
    setExemplaires('1')
    setResume('')
    setErreurs([])
    setSucces(null)
    setLignesCsv([])
    setResultatImport(null)
  }

  const csvHead: TableHeadCell[] = [
    { text: 'Titre' },
    { text: 'Auteur' },
    { text: 'Niveau' },
    { text: 'Catégorie' },
    { text: 'Exemplaires' },
    { text: 'État' },
  ]

  const csvRows: TableRowCell[][] = lignesCsv.map((ligne) => [
    { content: <strong>{ligne.titre || '—'}</strong> },
    { text: ligne.auteur || '—' },
    { text: NIVEAUX_LIVRE.find((n) => n.value === ligne.niveau)?.label ?? (ligne.niveau ? ligne.niveau : '—') },
    {
      text: CATEGORIES_LIVRE.find((c) => c.value === ligne.categorie)?.label ?? (ligne.categorie ? ligne.categorie : '—'),
    },
    { text: ligne.exemplaires > 0 ? String(ligne.exemplaires) : '—' },
    {
      content:
        ligne.statut === 'importe' ? (
          <Tag color="green">Importé</Tag>
        ) : ligne.statut === 'echec' ? (
          <Tag color="red">Échec</Tag>
        ) : ligne.erreurs.length > 0 ? (
          <span>
            <Tag color="red">Erreur</Tag> {ligne.erreurs.join(' · ')}
          </span>
        ) : (
          <Tag color="blue">Prêt à importer</Tag>
        ),
    },
  ])

  const livresValides = lignesValides.length

  return (
    <div className="lpv-container">
      {succes ? (
        <div className="lpv-t-question-page">
          <Panel title="Livre ajouté au catalogue" variante="success">
            <p>{succes}</p>
          </Panel>
          <p className="pb-3">
            <EnterText hrf="#">
              <p
                onClick={(e) => {
                  e.preventDefault()
                  reinitialiser()
                }}
              >
                Ajouter un autre livre
              </p>
            </EnterText>
          </p>
          <p>
            <EnterText hrf="/profs/bibliotheque">Retour au catalogue</EnterText>
          </p>
        </div>
      ) : (
        <QuestionPage
          actions={
            <Button
              disabled={pending}
              onClick={() => enregistrerLivre()}
              type="button"
              variant="success"
            >
              Ajouter au catalogue
            </Button>
          }
          question="Ajouter un livre"
          retour={{ href: '/profs/bibliotheque', label: 'Retour au catalogue' }}
        >
          {erreurs.length > 0 && <ErrorSummary errors={erreurs} />}

          <Details summary="Plusieurs livres à ajouter ? Importer un fichier CSV">
            <FileUpload
              accept=".csv,text/csv"
              hint="Une ligne par livre — colonnes : titre ; auteur ; isbn ; niveau ; categorie ; exemplaires ; resume. Séparateur « ; » ou «, », champs entre guillemets acceptés."
              id="csv-livres"
              label="Fichier CSV"
              name="csv-livres"
              onChange={lireFichierCsv}
            />
            {lignesCsv.length > 0 && (
              <>
                <InsetText>
                  {lignesCsv.length} ligne{lignesCsv.length > 1 ? 's' : ''} détectée
                  {lignesCsv.length > 1 ? 's' : ''} — {livresValides} livre{livresValides > 1 ? 's' : ''}
                  prêt{livresValides > 1 ? 's' : ''} à l&apos;import.
                </InsetText>
                <div style={{ overflowX: 'auto' }}>
                  <Table caption="" head={csvHead} rows={csvRows} />
                </div>
                <Button
                  disabled={pending || livresValides === 0}
                  onClick={() => {
                    void importerCsv()
                  }}
                  type="button"
                  variant="success"
                >
                  Importer {livresValides > 0 ? livresValides : ''} livre
                  {livresValides > 1 ? 's' : ''}
                </Button>
              </>
            )}
            {resultatImport && (
              <Panel title={`${resultatImport.importes} livre${resultatImport.importes > 1 ? 's' : ''} ajouté${resultatImport.importes > 1 ? 's' : ''} au catalogue`} variante="success">
                {resultatImport.echecs.length > 0 && (
                  <InsetText>
                    {resultatImport.echecs.map((echec) => (
                      <span key={echec.titre} style={{ display: 'block' }}>
                        « {echec.titre} » : {echec.motif}
                      </span>
                    ))}
                  </InsetText>
                )}
                {resultatImport.importes === 0 && <p>Aucun livre n&apos;a pu être créé.</p>}
              </Panel>
            )}
          </Details>

          <Details summary="Pré-remplir avec l'ISBN (facultatif)">
            <div className="flex items-baseline-last gap-x-2">
              <Input
                hint="Les chiffres au dos du livre (10 ou 13)."
                id="livre-isbn"
                label="ISBN"
                onChange={(e) => {
                  setIsbn(e.target.value)
                  setIsbnEtat(null)
                }}
                optional
                value={isbn}
              />
              <Button disabled={pending} onClick={rechercherIsbn} type="button" variant="primary">
                Rechercher
              </Button>
            </div>
            {isbnEtat && (
              <InsetText>
                <Tag
                  color={
                    isbnEtat.variante === 'invalide'
                      ? 'red'
                      : isbnEtat.variante === 'doublon'
                        ? 'orange'
                        : 'blue'
                  }
                >
                  {isbnEtat.variante === 'invalide'
                    ? 'ISBN invalide'
                    : isbnEtat.variante === 'doublon'
                      ? 'Déjà au catalogue'
                      : 'Non trouvé'}
                </Tag>{' '}
                {isbnEtat.texte}
                {isbnEtat.ficheHref && (
                  <span>
                    {' — '}
                    <a className="lpv-link-inline" href={isbnEtat.ficheHref}>
                      Voir la fiche
                    </a>
                  </span>
                )}
              </InsetText>
            )}
          </Details>

          <Input
            id="livre-titre"
            label="Titre"
            onChange={(e) => setTitre(e.target.value)}
            value={titre}
          />
          <Input
            id="livre-auteur"
            label="Auteur"
            onChange={(e) => setAuteur(e.target.value)}
            value={auteur}
          />
          <Input
            as="select"
            id="livre-niveau"
            label="Niveau conseillé"
            onChange={(e) => setNiveau(e.target.value)}
            optional
            options={[{ label: 'Choisir un niveau…', value: '' }, ...NIVEAUX_LIVRE]}
            value={niveau}
          />
          <Input
            as="select"
            id="livre-categorie"
            label="Catégorie"
            onChange={(e) => setCategorie(e.target.value)}
            optional
            options={[{ label: 'Choisir une catégorie…', value: '' }, ...CATEGORIES_LIVRE]}
            value={categorie}
          />
          <Input
            hint="Chaque exemplaire recevra son code LPV automatiquement."
            id="livre-exemplaires"
            label="Nombre d'exemplaires"
            min="1"
            onChange={(e) => setExemplaires(e.target.value)}
            type="number"
            value={exemplaires}
            className="max-w-[125px]"
          />
          <Input
            as="textarea"
            hint="Quelques phrases qui présentent l'ouvrage aux élèves et aux familles."
            id="livre-resume"
            label="Résumé"
            onChange={(e) => setResume(e.target.value)}
            optional
            value={resume}
          />
        </QuestionPage>
      )}
    </div>
  )
}
