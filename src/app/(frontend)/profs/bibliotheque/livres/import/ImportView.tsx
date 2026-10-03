'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { BackLink, Button, FileUpload, InsetText, Panel, SoloCheckbox, Tag } from '@/components/atoms'
import { EnterText } from '@/components/atoms/a-enter-text'
import { Progress } from '@/components/atoms/a-progress'
import { Accordion, ErrorSummary, Pagination, Radios, Table } from '@/components/molecules'
import { buildPaginationItems } from '@/components/molecules/m-pagination'
import { QuestionPage, StatsGrid } from '@/components/templates'
import { analyserImportLivre, labelNiveauLivre, useCreerExemplaire, useCreerLivre, useListCatalogue } from '@/bibliotheque'
import type { LigneImportLivre } from '@/bibliotheque'

// Page d'import CSV de livres — scénario examples/import-books.html adapté
// au design system. Quatre états d'écran (pas de route : le fichier vit en
// mémoire client) :
// 1. fichier — sélection + colonnes attendues (QuestionPage) ;
// 2. verif   — compteurs, filtres (toutes / prêtes / à préciser / erreurs),
//              sélection ligne à ligne (lignes importables cochées par défaut,
//              erreurs non cochables), actions « tout (dé)sélectionner » sur la
//              vue filtrée, aperçu paginé ;
// 3. import  — jauge réelle (versement séquentiel, livre courant affiché) ;
// 4. bilan   — Panel succès + table des lignes ignorées.
// Les doublons sont pré-signales par le domaine (livre.import) ; la garde
// serveur (livresBeforeChange) reste la référence en cas de divergence.

const IMPORT_PAR_PAGE = 15

type Etape = 'bilan' | 'fichier' | 'import' | 'verif'

type FiltreApercu = 'a_preciser' | 'erreur' | 'pret' | 'toutes'

// Statut dérivé de l'analyse : priorité à l'erreur bloquante, puis à la valeur
// non reconnue (« à préciser »), sinon la ligne est prête.
type StatutLigne = 'a_preciser' | 'erreur' | 'pret'
const statutDe = (ligne: LigneImportLivre): StatutLigne =>
  ligne.erreurs.length > 0 ? 'erreur' : ligne.aPreciser ? 'a_preciser' : 'pret'

const LIBELLE_FILTRE: Record<FiltreApercu, string> = {
  a_preciser: 'À préciser',
  erreur: 'Erreurs',
  pret: 'Prêtes',
  toutes: 'Toutes',
}
const FILTRES: FiltreApercu[] = ['toutes', 'pret', 'a_preciser', 'erreur']

interface BilanImport {
  aPreciser: number
  echecs: { fichierLigne: number; motif: string; titre: string }[]
  importes: number
}

const tronquer = (texte: string): string => (texte.length > 60 ? `${texte.slice(0, 60)}…` : texte)

/** Suffixe au pluriel : s(0)='' , s(1)='', s(2)='s'. */
const s = (nombre: number, formePlurielle = 's'): string => (nombre > 1 ? formePlurielle : '')

export default function ImportView() {
  const router = useRouter()
  const params = useSearchParams()
  const catalogue = useListCatalogue()
  const creer = useCreerLivre()
  const creerExemplaire = useCreerExemplaire()

  const [texteCsv, setTexteCsv] = useState<string | null>(null)
  const [lignes, setLignes] = useState<LigneImportLivre[] | null>(null)
  const [erreurFichier, setErreurFichier] = useState<string | null>(null)
  const [filtre, setFiltre] = useState<FiltreApercu>('toutes')
  const [selection, setSelection] = useState<Set<number>>(() => new Set())
  const [etape, setEtape] = useState<Etape>('fichier')
  const [total, setTotal] = useState(0)
  const [cours, setCours] = useState({ index: 0, titre: '' })
  const [bilan, setBilan] = useState<BilanImport | null>(null)

  function allerEtape(etapeCible: Etape) {
    setEtape(etapeCible)
    window.scrollTo({ top: 0 })
  }

  function lireFichier(event: React.ChangeEvent<HTMLInputElement>) {
    const fichier = event.target.files?.[0]
    if (!fichier) return
    const lecteur = new FileReader()
    lecteur.onload = () => {
      setTexteCsv(String(lecteur.result ?? ''))
      setErreurFichier(null)
    }
    lecteur.readAsText(fichier, 'utf-8')
  }

  function continuer() {
    if (!texteCsv) {
      setErreurFichier('Sélectionne un fichier CSV (export Excel ou Google Sheets).')
      return
    }
    const analyse = analyserImportLivre(texteCsv, catalogue.data ?? [])
    if (analyse.length === 0) {
      setErreurFichier('Aucune ligne de données détectée dans le fichier.')
      return
    }
    setLignes(analyse)
    setFiltre('toutes')
    // Toute ligne importable est présélectionnée : l'utilisateur ne décoche
    // que ce qu'il juge indésirable. Les lignes en erreur ne sont jamais
    // cochables (elles ne partent jamais à l'import).
    setSelection(
      new Set(analyse.filter((ligne) => ligne.erreurs.length === 0).map((ligne) => ligne.fichierLigne)),
    )
    // L'aperçu repart à la page 1 : l'URL ne porte que « page » (pagination).
    router.replace('/profs/bibliotheque/livres/import')
    allerEtape('verif')
  }

  function lancerImport() {
    const candidats = (lignes ?? []).filter(
      (ligne) => ligne.erreurs.length === 0 && selection.has(ligne.fichierLigne),
    )
    if (candidats.length === 0) return

    setTotal(candidats.length)
    allerEtape('import')
    void verser(candidats)
  }

  async function verser(candidats: LigneImportLivre[]) {
    const echecs: BilanImport['echecs'] = []
    let importes = 0
    let aPreciser = 0

    for (let i = 0; i < candidats.length; i += 1) {
      const ligne = candidats[i]
      setCours({ index: i + 1, titre: ligne.titre })
      try {
        const id = await creer.mutateAsync({
          auteur: ligne.auteur,
          categorie: ligne.categorie || undefined,
          isbn: ligne.isbn || undefined,
          niveau: ligne.niveau || undefined,
          resume: ligne.resume || undefined,
          titre: ligne.titre,
        })
        for (let suivant = 0; suivant < ligne.exemplaires; suivant += 1) {
          await creerExemplaire.mutateAsync({ livre: id })
        }
        importes += 1
        if (ligne.aPreciser) aPreciser += 1
      } catch (err) {
        echecs.push({
          fichierLigne: ligne.fichierLigne,
          motif: err instanceof Error ? err.message : 'Le livre n’a pas pu être créé.',
          titre: ligne.titre,
        })
      }
    }

    setCours({ index: 0, titre: '' })
    setBilan({ aPreciser, echecs, importes })
    router.replace('/profs/bibliotheque/livres/import')
    allerEtape('bilan')
  }

  if (etape === 'import') {
    return (
      <div className="lpv-container">
        <h1 className="lpv-h1">Import en cours</h1>
        <p>
          {cours.titre
            ? `Enregistrement de ${cours.index} sur ${total} : « ${cours.titre} »`
            : `Enregistrement de ${cours.index} sur ${total}…`}
        </p>
        <Progress label="Progression de l'import des livres" max={total} value={cours.index} />
        <p className="lpv-muted">Merci de ne pas fermer cette page pendant l&apos;import.</p>
      </div>
    )
  }

  if (etape === 'bilan' && bilan) {
    return (
      <div className="lpv-container">
        <Panel title="Import terminé" variante={bilan.importes > 0 ? 'success' : 'warning'}>
          <p>
            {bilan.importes > 0
              ? `${bilan.importes} livre${s(bilan.importes)} ajouté${s(bilan.importes)} au catalogue`
              : 'Aucun livre n\'a pu être ajouté : corrige les lignes listées ci-dessous puis réimporte le fichier.'}
            {bilan.aPreciser > 0
              ? ` — dont ${bilan.aPreciser} livre${s(bilan.aPreciser)} sans niveau ni catégorie reconnu${s(bilan.aPreciser)} (à préciser sur les fiches).`
              : ''}
            {bilan.echecs.length > 0
              ? ` ${bilan.importes > 0 ? '·' : '—'} ${bilan.echecs.length} ligne${s(bilan.echecs.length)} ignorée${s(bilan.echecs.length)}.`
              : ''}
          </p>
        </Panel>

        {bilan.echecs.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <Table
              caption=""
              head={[
                { text: 'Ligne', format: 'numeric' },
                { text: 'Titre' },
                { text: 'Motif' },
              ]}
              rows={bilan.echecs.map((echec) => [
                { format: 'numeric' as const, text: String(echec.fichierLigne) },
                { content: <strong>{echec.titre || '—'}</strong> },
                { text: echec.motif },
              ])}
            />
          </div>
        )}

        <div className="pb-3">
          <EnterText
            hrf="#"
            onClick={(event) => {
              event.preventDefault()
              setTexteCsv(null)
              setLignes(null)
              setBilan(null)
              router.replace('/profs/bibliotheque/livres/import')
              allerEtape('fichier')
            }}
          >
            Importer un autre fichier
          </EnterText>
        </div>
        <div>
          <EnterText hrf="/profs/bibliotheque">Retour au catalogue</EnterText>
        </div>
      </div>
    )
  }

  if (etape === 'verif' && lignes) {
    const aCorriger = lignes.filter((ligne) => statutDe(ligne) === 'erreur').length
    const aPreciser = lignes.filter((ligne) => statutDe(ligne) === 'a_preciser').length
    const dejaAuCatalogue = lignes.filter((ligne) =>
      ligne.erreurs.includes('déjà au catalogue'),
    ).length
    const importables = lignes.length - aCorriger
    const filtrees = filtre === 'toutes' ? lignes : lignes.filter((ligne) => statutDe(ligne) === filtre)
    const importablesFiltrees = filtrees.filter((ligne) => statutDe(ligne) !== 'erreur')
    const selectionFiltree = importablesFiltrees.filter((ligne) => selection.has(ligne.fichierLigne)).length

    // « Tout (dé)sélectionner » vise tout l'ensemble filtré, pas seulement la
    // page affichée : on ne risque pas d'oublier des lignes invisibles.
    function selectionnerFiltre() {
      setSelection(
        (actuelle) => new Set([...actuelle, ...importablesFiltrees.map((ligne) => ligne.fichierLigne)]),
      )
    }
    function deselectionnerFiltre() {
      setSelection((actuelle) => {
        const suivante = new Set(actuelle)
        importablesFiltrees.forEach((ligne) => suivante.delete(ligne.fichierLigne))
        return suivante
      })
    }
    function basculer(ligne: LigneImportLivre) {
      setSelection((actuelle) => {
        const suivante = new Set(actuelle)
        if (suivante.has(ligne.fichierLigne)) suivante.delete(ligne.fichierLigne)
        else suivante.add(ligne.fichierLigne)
        return suivante
      })
    }

    const totalPages = Math.max(1, Math.ceil(filtrees.length / IMPORT_PAR_PAGE))
    const pageBrute = Number.parseInt(params.get('page') ?? '1', 10)
    const pageDemandee = Number.isNaN(pageBrute) ? 1 : Math.max(1, pageBrute)
    const page = Math.min(pageDemandee, totalPages)
    const affichees = filtrees.slice((page - 1) * IMPORT_PAR_PAGE, page * IMPORT_PAR_PAGE)
    const hrefPourPage = (pageCible: number): string =>
      pageCible <= 1
        ? '/profs/bibliotheque/livres/import'
        : `/profs/bibliotheque/livres/import?page=${pageCible}`
    const paginationItems =
      totalPages > 1
        ? buildPaginationItems({ currentPage: page, hrefFor: hrefPourPage, totalPages })
        : []

    return (
      <div className="lpv-container">
        <BackLink href="/profs/bibliotheque/livres/import" onClick={() => allerEtape('fichier')}>
          Choisir un autre fichier
        </BackLink>
        <h1 className="lpv-h1">Vérifiez l&apos;import</h1>

        <StatsGrid
          stats={[
            { value: lignes.length, label: 'Lignes lues' },
            { value: importables, label: 'Prêtes à importer' },
            { value: aCorriger, label: 'À corriger', type: 'alert' },
          ]}
        />

        {dejaAuCatalogue > 0 && (
          <InsetText>
            « Déjà au catalogue » n&apos;est pas une erreur à corriger dans le fichier : ces livres
            ont déjà été importés et ne sont jamais ajoutés une seconde fois. Pour leur ajouter des
            exemplaires, passe par leur fiche depuis le catalogue.
          </InsetText>
        )}
        {aCorriger - dejaAuCatalogue > 0 && (
          <InsetText>
            Les lignes en erreur ne seront pas importées : corrige-les dans ton fichier, puis
            réimporte-le (les livres déjà ajoutés ne le seront pas deux fois).
          </InsetText>
        )}
        {dejaAuCatalogue > 0 && dejaAuCatalogue === lignes.length && (
          <InsetText>
            Tout ce fichier est déjà au catalogue : il n&apos;y a rien à importer ici — les livres
            sont bien dans le catalogue. Pour essayer l&apos;import, utilise un fichier avec de
            nouveaux livres.
          </InsetText>
        )}
        {aPreciser > 0 && (
          <InsetText>
            Niveau ou catégorie non reconnu pour {aPreciser} ligne{s(aPreciser)} : le livre est
            importé sans cette information (« à préciser sur la fiche »).
          </InsetText>
        )}

        <Radios
          idPrefix="filtre-import-livres"
          inline
          legendSize="s"
          name="Filtrer les lignes"
          onChange={(event) => {
            // Le filtre repart à la page 1 : l'URL ne garde que le paramètre
            // page retiré ici.
            setFiltre(event.target.value as FiltreApercu)
            router.replace('/profs/bibliotheque/livres/import')
          }}
          options={FILTRES.map((cle) => ({
            label: `${LIBELLE_FILTRE[cle]} (${cle === 'toutes' ? lignes.length : cle === 'pret' ? importables - aPreciser : cle === 'a_preciser' ? aPreciser : aCorriger})`,
            value: cle,
          }))}
          value={filtre}
        />

        {importablesFiltrees.length > 0 && (
          <div style={{ alignItems: 'center', display: 'flex', gap: '1.5rem' }}>
            {selectionFiltree < importablesFiltrees.length && (
              <EnterText
                hrf="#"
                onClick={(event) => {
                  event.preventDefault()
                  selectionnerFiltre()
                }}
              >
                Tout sélectionner ({importablesFiltrees.length})
              </EnterText>
            )}
            {selectionFiltree > 0 && (
              <EnterText
                hrf="#"
                onClick={(event) => {
                  event.preventDefault()
                  deselectionnerFiltre()
                }}
              >
                Tout désélectionner ({selectionFiltree})
              </EnterText>
            )}
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <Table
            caption=""
            head={[
              { text: 'Ligne', format: 'numeric' },
              { text: 'Titre' },
              { text: 'Auteur' },
              { text: 'Niveau' },
              { text: 'Ex.', format: 'numeric' },
              { text: 'Résumé' },
              { text: 'Statut' },
              { text: 'Importer ?' },
            ]}
            rows={affichees.map((ligne) => [
              { format: 'numeric' as const, text: String(ligne.fichierLigne) },
              { content: <strong>{ligne.titre || '—'}</strong> },
              { text: ligne.auteur || '—' },
              {
                text: ligne.niveau
                  ? (labelNiveauLivre(ligne.niveau) ?? ligne.niveau)
                  : ligne.niveauTexte
                    ? `${ligne.niveauTexte} (à préciser)`
                    : '—',
              },
              { format: 'numeric' as const, text: ligne.exemplaires > 0 ? String(ligne.exemplaires) : '—' },
              { text: ligne.resume ? tronquer(ligne.resume) : '—' },
              {
                content:
                  ligne.erreurs.length > 0 ? (
                    <>
                      <Tag color="red">Erreur</Tag> {ligne.erreurs.join(' · ')}
                    </>
                  ) : ligne.aPreciser ? (
                    <>
                      <Tag color="orange">À préciser</Tag> {ligne.niveauTexte || ligne.categorieTexte}
                    </>
                  ) : (
                    <Tag color="green">Prêt</Tag>
                  ),
              },
              {
                content: (
                  <SoloCheckbox
                    checked={selection.has(ligne.fichierLigne)}
                    disabled={ligne.erreurs.length > 0}
                    label={
                      ligne.erreurs.length > 0
                        ? `Import impossible ligne ${ligne.fichierLigne} : ${ligne.erreurs.join(' · ')}`
                        : `Importer « ${ligne.titre || 'sans titre'} » (ligne ${ligne.fichierLigne})`
                    }
                    onChange={() => {
                      basculer(ligne)
                    }}
                  />
                ),
              },
            ])}
          />
        </div>

        {totalPages > 1 && (
          <Pagination
            ariaLabel="Pagination de l'aperçu d'import"
            items={paginationItems}
            next={page < totalPages ? { href: hrefPourPage(page + 1) } : undefined}
            previous={page > 1 ? { href: hrefPourPage(page - 1) } : undefined}
          />
        )}

        <Button
          disabled={selection.size === 0}
          onClick={() => {
            lancerImport()
          }}
          type="button"
          variant="success"
        >
          {selection.size === 0
            ? dejaAuCatalogue === lignes.length && dejaAuCatalogue > 0
              ? 'Rien à importer — tout ce fichier est déjà au catalogue'
              : 'Sélectionne au moins une ligne'
            : selection.size === 1
              ? 'Importer 1 livre'
              : `Importer les ${selection.size} livres`}
        </Button>
      </div>
    )
  }

  // Étape 1 : sélection du fichier (QuestionPage, un objectif par page).
  const lignesCharges = texteCsv ? texteCsv.split(/\r?\n/).filter((l) => l.trim() !== '').length : 0

  return (
    <div className="lpv-container">
      <QuestionPage
        actions={
          <Button
            onClick={() => {
              continuer()
            }}
            type="button"
            variant="success"
          >
            Continuer
          </Button>
        }
        question="Importer des livres"
        retour={{
          href: '/profs/bibliotheque/livres/nouveau',
          label: "Retour à l'ajout d'un livre",
        }}
      >
        {erreurFichier && (
          <ErrorSummary errors={[{ fieldId: 'csv-livres', text: erreurFichier }]} />
        )}
        <p className="text-[1.2rem] mb-2">
          Ajoute plusieurs livres d&apos;un coup à partir d&apos;un fichier CSV (export Excel ou
          Google Sheets).
        </p>
        <Accordion
          id={'import-book'}
          sections={[
            {
              title: "Plus d'informations...",
              summary: "Découvrez qu'elle sont les colonnes attendues.",
              content: (
                <p>
                  <strong>Colonnes attendues</strong>
                  <br />
                  <br />
                  <code>titre ; auteur ; isbn ; niveau ; categorie ; exemplaires ; resume</code>
                  <br />
                  <br />
                  <code>Titre</code> et <code>auteur</code> sont requis.
                  <br />
                  <br />
                  Catégorie et résumé sont facultatifs ;
                  <br />
                  <br />
                  les valeurs non reconnues des niveaux et catégories sont importées « à préciser
                  sur la fiche ». Séparateur « ; » ou «, », champs entre guillemets acceptés. met-le
                  au résumé s&apos;il contient « ; ».
                </p>
              ),
            },
          ]}
        />
        {/*<InsetText>*/}
        {/*  <strong>Colonnes attendues</strong>*/}
        {/*  <br />*/}
        {/*  <br />*/}
        {/*  <code>titre ; auteur ; isbn ; niveau ; categorie ; exemplaires ; resume</code>*/}
        {/*  <br />*/}
        {/*  <br />*/}
        {/*  <code>Titre</code> et <code>auteur</code> sont requis.*/}
        {/*  <br />*/}
        {/*  <br />*/}
        {/*  Catégorie et résumé sont facultatifs ;*/}
        {/*  <br />*/}
        {/*  <br />*/}
        {/*  les valeurs non reconnues des niveaux et catégories sont importées « à préciser sur la*/}
        {/*  fiche ». Séparateur « ; » ou «, », champs entre guillemets acceptés. met-le au résumé*/}
        {/*  s&apos;il contient « ; ».*/}
        {/*</InsetText>*/}
        <FileUpload
          accept=".csv,text/csv"
          hint="Une ligne par livre (l'en-tête est comprise)."
          id="csv-livres"
          label="Fichier CSV"
          name="csv-livres"
          onChange={lireFichier}
        />
        {texteCsv && (
          <p className="lpv-muted">
            Fichier chargé — {lignesCharges} ligne{s(lignesCharges)} lue{s(lignesCharges)}.
          </p>
        )}
      </QuestionPage>
    </div>
  )
}
