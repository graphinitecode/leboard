'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'

import { Icon, InsetText, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { ActionRow, AlertCard, EmptyState, Pagination, Table, Toast } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { buildPaginationItems } from '@/components/molecules/m-pagination'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import { StatsGrid } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import {
  CATEGORIES_LIVRE,
  estPretEnCours,
  joursDeRetard,
  labelNiveauLivre,
  NIVEAUX_LIVRE,
  statutPret,
  trierParRetour,
  useListCatalogue,
  useListTousPretsEnCours,
  useMarquerRetourne,
} from '@/bibliotheque'

// Le catalogue s'affiche par lots de 10 livres (page lue dans ?page=).
const LIVRES_PAR_PAGE = 10

// Libellés de catégorie, enrichis : dérivés de la source unique domain.
const CATEGORIE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES_LIVRE.map((option) => [option.value, option.label]),
)

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function BibliothequeView({ peutGerer }: { peutGerer: boolean }) {
  return (
    <Suspense fallback={<p className="lpv-muted">Chargement…</p>}>
      <VueBibliotheque peutGerer={peutGerer} />
    </Suspense>
  )
}

function VueBibliotheque({ peutGerer }: { peutGerer: boolean }) {
  const router = useRouter()
  const params = useSearchParams()
  const prets = useListTousPretsEnCours()
  const catalogue = useListCatalogue()
  const marquerRetourne = useMarquerRetourne()
  const [recherche, setRecherche] = useState('')
  const [niveauFiltre, setNiveauFiltre] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pretRetourne, setPretRetourne] = useState(false)
  const [confirmRetour, setConfirmRetour] = useState<{ pretId: number; titre: string } | null>(
    null,
  )

  // Retour de l'assistant prêt (?pret=enregistre) : toast dérivé de l'URL.
  const pretEnregistre = params.get('pret') === 'enregistre'

  const enCours = (prets.data ?? []).filter(estPretEnCours)
  const retards = enCours.filter((pret) => joursDeRetard(pret.dateRetourPrevue) > 0)
  // Prêts à rendre dans les 3 prochains jours (les retards ont leur section)
  const rappels = trierParRetour(enCours.filter((pret) => statutPret(pret) === 'bientot'))

  const catalogueFiltre = useMemo(() => {
    let liste = catalogue.data ?? []
    if (niveauFiltre) {
      liste = liste.filter((livre) => livre.niveau === niveauFiltre)
    }
    const q = recherche.trim().toLowerCase()
    if (!q) return liste
    return liste.filter(
      (livre) =>
        livre.titre.toLowerCase().includes(q) ||
        (livre.auteur ?? '').toLowerCase().includes(q),
    )
  }, [catalogue.data, recherche, niveauFiltre])

  // Pagination du catalogue : page lue dans l'URL (?page=N), bornée au total
  // courant — un lien profond périmé (liste réduite par les filtres) retombe
  // sur la dernière page de résultats.
  const pageBrute = Number.parseInt(params.get('page') ?? '1', 10)
  const totalPages = Math.max(1, Math.ceil(catalogueFiltre.length / LIVRES_PAR_PAGE))
  const pageDemandee = Number.isNaN(pageBrute) ? 1 : Math.max(1, pageBrute)
  const page = Math.min(pageDemandee, totalPages)
  const cataloguePage = useMemo(
    () => catalogueFiltre.slice((page - 1) * LIVRES_PAR_PAGE, page * LIVRES_PAR_PAGE),
    [catalogueFiltre, page],
  )

  // Liens de pagination : les autres params (ex. ?pret=enregistre) sont
  // conservés ; ?page disparaît en page 1 (URL canonique).
  const hrefPourPage = (pageCible: number): string => {
    const suivants = new URLSearchParams(params.toString())
    if (pageCible <= 1) {
      suivants.delete('page')
    } else {
      suivants.set('page', String(pageCible))
    }
    const query = suivants.toString()
    return `/profs/bibliotheque${query ? `?${query}` : ''}`
  }
  const paginationItems =
    totalPages > 1
      ? buildPaginationItems({ currentPage: page, hrefFor: hrefPourPage, totalPages })
      : []

  // Changement de filtres (recherche ou niveau) : revenir à la page 1 de
  // l'URL — débounce pour ne pas navigate à chaque frappe. Au premier rendu
  // la signature est déjà posée : aucun replace.
  const derniersFiltres = useRef(`${recherche}|${niveauFiltre}`)
  useEffect(() => {
    const signature = `${recherche}|${niveauFiltre}`
    if (signature === derniersFiltres.current) return undefined
    derniersFiltres.current = signature
    const timeout = setTimeout(() => router.replace('/profs/bibliotheque'), 400)
    return () => clearTimeout(timeout)
  }, [niveauFiltre, recherche, router])

  async function retourner(pretId: number, motDePasse?: string) {
    setErreur(null)
    if (!motDePasse) return
    try {
      await marquerRetourne.mutateAsync({ motDePasse, pretId })
      setPretRetourne(true)
      setConfirmRetour(null)
    } catch (err) {
      setErreur(
        err instanceof Error
          ? err.message
          : 'Impossible de marquer le prêt comme retourné. Réessayez.',
      )
    }
  }

  const stats: DashboardStat[] = [
    { value: catalogue.data?.length ?? '—', label: 'Livres au catalogue' },
    { value: prets.isLoading ? '—' : enCours.length, label: 'Prêts en cours' },
    { value: prets.isLoading ? '—' : retards.length, label: 'Retards', type: 'alert' },
  ]

  const catalogueHead: TableHeadCell[] = [
    { text: 'Titre' },
    { text: 'Auteur' },
    { text: 'Niveau' },
    { text: 'Statut' },
    { text: '' },
  ]

  const catalogueRows: TableRowCell[][] = cataloguePage.map((livre) => {
    const dispo = livre.exemplaires.some((ex) => ex.disponible)
    return [
      { content: <strong>{livre.titre}</strong> },
      { text: livre.auteur ?? '—' },
      { text: livre.niveau ? (labelNiveauLivre(livre.niveau) ?? livre.niveau) : '—' },
      {
        content: (
          <Tag color={dispo ? 'green' : 'red'}>
            {dispo ? 'Disponible' : 'Emprunté'}
          </Tag>
        ),
      },
      {
        content: (
          <Link className="lpv-link-inline" href={`/profs/bibliotheque/livres/${livre.id}`}>
            Voir
          </Link>
        ),
      },
    ]
  })

  return (
    <>
      {(erreur || prets.isError || catalogue.isError) && (
        <InsetText>
          {erreur ??
            'Impossible de charger la bibliothèque. Rechargez la page ou réessayez plus tard.'}
        </InsetText>
      )}
      {pretRetourne && (
        <Toast
          message="Prêt marqué comme retourné"
          type="success"
          onClose={() => setPretRetourne(false)}
        />
      )}
      {pretEnregistre && (
        <Toast
          message="Prêt enregistré"
          type="success"
          onClose={() => router.replace('/profs/bibliotheque')}
        />
      )}

      {confirmRetour ? (
        <ConfirmAction
          confirmLabel="Confirmer le retour"
          description="Le prêt sera clôturé et l'exemplaire redeviendra disponible. Confirmez avec votre mot de passe."
          onClose={() => {
            setConfirmRetour(null)
            setErreur(null)
          }}
          onConfirm={(motDePasse) => {
            void retourner(confirmRetour.pretId, motDePasse)
          }}
          pending={marquerRetourne.isPending}
          pendingLabel="Confirmation…"
          requirePassword
          title="Marquer ce prêt comme retourné ?"
        />
      ) : null}

      <h1 className="lpv-h1">Bibliothèque</h1>
      <p
        className="lpv-muted pb-7"
        style={{
          fontSize: '1.225rem',
          paddingBottom: '1.75rem',
          fontWeight: '500',
        }}
      >
        Gérez le catalogue de livres de l&apos;association : suivez les prêts en cours, repérez les
        retards et consultez les exemplaires disponibles.
      </p>

      <StatsGrid stats={stats} />

      <div className="lpv-o-bibliotheque__searchbar">
        <label className="lpv-visually-hidden" htmlFor="recherche-catalogue">
          Rechercher un titre ou un auteur
        </label>
        <input
          className="lpv-a-input"
          id="recherche-catalogue"
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un titre, un auteur…"
          type="search"
          value={recherche}
        />
        <label className="lpv-visually-hidden" htmlFor="filtre-niveau">
          Filtrer par niveau
        </label>
        <select
          className="lpv-a-select"
          id="filtre-niveau"
          onChange={(e) => setNiveauFiltre(e.target.value)}
          value={niveauFiltre}
        >
          <option value="">Tous les niveaux</option>
          {NIVEAUX_LIVRE.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {peutGerer ? (
          <Button href="/profs/bibliotheque/prets/nouveau" variant="success">
            Enregistrer un prêt
          </Button>
        ) : null}
      </div>

      <div className="lpv-t-dashboard-page__columns">
        <div className="lpv-t-dashboard-page__main">
          <section className="lpv-t-dashboard-page__section" aria-labelledby="retards-titre">
            <h2 className="lpv-h2" id="retards">
              Retards
            </h2>
            <p>
              <Link className="lpv-link-inline" href="/profs/bibliotheque/prets">
                Voir tous les prêts en cours
              </Link>
            </p>
            {prets.isLoading ? (
              <p className="lpv-muted">Chargement des prêts…</p>
            ) : retards.length === 0 ? (
              <InsetText>Aucun retard. Tous les prêts sont dans les temps.</InsetText>
            ) : (
              retards.map((pret) => (
                <ActionRow
                  accent="red"
                  action={
                    peutGerer
                      ? {
                          disabled: marquerRetourne.isPending,
                          label: 'Marquer comme retourné',
                          onClick: () =>
                            setConfirmRetour({
                              pretId: pret.id,
                              titre: pret.livreLabel ?? pret.exemplaireCode ?? 'ce livre',
                            }),
                          variant: 'primary',
                        }
                      : undefined
                  }
                  key={pret.id}
                  meta={`Retour prévu le ${formatDate(pret.dateRetourPrevue)} — ${joursDeRetard(pret.dateRetourPrevue)} jour(s) de retard`}
                  title={`« ${pret.livreLabel ?? pret.exemplaireCode ?? 'Livre'} » emprunté par ${pret.eleveLabel ?? 'un élève'}`}
                />
              ))
            )}
          </section>

          <section className="lpv-t-dashboard-page__section" aria-labelledby="catalogue">
            <h2 className="lpv-h2" id="catalogue">
              Catalogue
            </h2>
            {catalogue.isLoading ? (
              <p className="lpv-muted">Chargement du catalogue…</p>
            ) : catalogueFiltre.length === 0 ? (
              <EmptyState
                actions={
                  recherche || niveauFiltre
                    ? [{ label: 'Réinitialiser les filtres', onClick: () => {
                        setRecherche('')
                        setNiveauFiltre('')
                      }, variant: 'secondary' }]
                    : undefined
                }
                description="Essaie un autre titre, auteur ou niveau."
                icon="boxicons:search"
                title="Aucun livre ne correspond à ta recherche"
                variant="neutral"
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table caption="" head={catalogueHead} rows={catalogueRows} />
              </div>
            )}
            {totalPages > 1 && (
              <Pagination
                ariaLabel="Pagination du catalogue"
                items={paginationItems}
                next={page < totalPages ? { href: hrefPourPage(page + 1) } : undefined}
                previous={page > 1 ? { href: hrefPourPage(page - 1) } : undefined}
              />
            )}
          </section>
        </div>

        <aside className="lpv-t-dashboard-page__aside">
          <div className="lpv-t-dashboard-page__aside-card">
            <h3 className="lpv-t-dashboard-page__aside-card__title">Rappels à venir</h3>
            {rappels.length === 0 ? (
              <p className="lpv-t-dashboard-page__aside-card__empty-text">
                Aucun rappel pour les prochains jours.
              </p>
            ) : (
              <div className="lpv-t-dashboard-page__aside-card__stack">
                {rappels.map((pret) => (
                  <AlertCard
                    accent="blue"
                    icon={false}
                    key={pret.id}
                    titre={pret.eleveLabel ?? 'Élève'}
                  >
                    &laquo; {pret.livreLabel ?? pret.exemplaireCode} &raquo; / retour prévu le{' '}
                    {formatDate(pret.dateRetourPrevue)}
                  </AlertCard>
                ))}
              </div>
            )}
          </div>
          {peutGerer ? (
            <div className="lpv-t-dashboard-page__aside-card">
              <h3 className="lpv-t-dashboard-page__aside-card__title">Alimenter le catalogue</h3>
              <p className="lpv-t-dashboard-page__aside-card__empty-text" style={{ marginTop: 0 }}>
                Nouvel ouvrage à référencer, ou plusieurs livres d&apos;un coup depuis un CSV.
              </p>
              <Button
                href="/profs/bibliotheque/livres/nouveau"
                variant="secondary"
                className="w-full mt-7 flex justify-center items-start"
              >
                <Icon icon={'rivet-icons:plus-circle-solid'} size={19} className="inline-flex -translate-y-px" />
                &nbsp;Nouveau livre
              </Button>
              <Button
                href="/profs/bibliotheque/livres/import"
                variant="secondary"
                className="w-full mt-3 flex justify-center items-start"
              >
                <Icon icon={'rivet-icons:upload'} size={19} className="inline-flex -translate-y-px" />
                &nbsp;Importer un CSV
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  )
}

export { CATEGORIE_LABELS, formatDate }
