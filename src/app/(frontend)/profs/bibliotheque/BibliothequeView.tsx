'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useMemo, useState } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { ActionRow, AlertCard, Table, Toast } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import {
  estPretEnCours,
  joursDeRetard,
  useListCatalogue,
  useListTousPretsEnCours,
  useMarquerRetourne,
} from '@/bibliotheque'

const NIVEAU_LABELS: Record<string, string> = {
  primaire: 'Primaire',
  college: 'Collège',
  lycee: 'Lycée',
}

const CATEGORIE_LABELS: Record<string, string> = {
  lecture: 'Lecture',
  methodologie: 'Méthodologie',
  anglais: 'Anglais',
  manuel: 'Manuel',
  autre: 'Autre',
}

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

  // Retour de l'assistant prêt (?pret=enregistre) : toast dérivé de l'URL.
  const pretEnregistre = params.get('pret') === 'enregistre'

  const enCours = (prets.data ?? []).filter(estPretEnCours)
  const retards = enCours.filter((pret) => joursDeRetard(pret.dateRetourPrevue) > 0)
  const rappels = enCours.filter((pret) => {
    const jours = joursDeRetard(pret.dateRetourPrevue)
    return jours === 0 || jours === -2 || jours === -1
  })

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

  async function retourner(pretId: number) {
    setErreur(null)
    try {
      await marquerRetourne.mutateAsync(pretId)
      setPretRetourne(true)
    } catch {
      setErreur('Impossible de marquer le prêt comme retourné. Réessayez.')
    }
  }

  const catalogueHead: TableHeadCell[] = [
    { text: 'Titre' },
    { text: 'Auteur' },
    { text: 'Niveau' },
    { text: 'Statut' },
    { text: '' },
  ]

  const catalogueRows: TableRowCell[][] = catalogueFiltre.map((livre) => {
    const dispo = livre.exemplaires.some((ex) => ex.disponible)
    return [
      { content: <strong>{livre.titre}</strong> },
      { text: livre.auteur ?? '—' },
      { text: livre.niveau ? NIVEAU_LABELS[livre.niveau] ?? livre.niveau : '—' },
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
          {erreur ?? 'Impossible de charger la bibliothèque. Rechargez la page ou réessayez plus tard.'}
        </InsetText>
      )}
      {pretRetourne && (
        <Toast message="Prêt marqué comme retourné" type="success" onClose={() => setPretRetourne(false)} />
      )}
      {pretEnregistre && (
        <Toast
          message="Prêt enregistré"
          type="success"
          onClose={() => router.replace('/profs/bibliotheque')}
        />
      )}

      <h1 className="lpv-h1">Bibliothèque</h1>
      <p className="lpv-muted">
        Gérez le catalogue de livres de l&apos;association : suivez les prêts en cours,
        repérez les retards et consultez les exemplaires disponibles.
      </p>

      <div className="lpv-cards-grid lpv-cards-grid--3">
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__value">{catalogue.data?.length ?? '—'}</span>
          <div className="lpv-stat__label">Livres au catalogue</div>
        </div>
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__value">{prets.isLoading ? '—' : enCours.length}</span>
          <div className="lpv-stat__label">Prêts en cours</div>
        </div>
        <div className="lpv-card lpv-stat alert">
          <span className="lpv-stat__value">{prets.isLoading ? '—' : retards.length}</span>
          <div className="lpv-stat__label">Retards</div>
        </div>
      </div>

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
          <option value="primaire">Primaire</option>
          <option value="college">Collège</option>
          <option value="lycee">Lycée</option>
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
                          onClick: () => retourner(pret.id),
                          variant: 'secondary',
                        }
                      : undefined
                  }
                  key={pret.id}
                  meta={`Retour prévu le ${formatDate(pret.dateRetourPrevue)} — ${joursDeRetard(pret.dateRetourPrevue)} jour(s) de retard`}
                  title={`« ${pret.livreLabel ?? pret.exemplaireCode ?? 'Livre'} » — emprunté par ${pret.eleveLabel ?? 'un élève'}`}
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
              <InsetText>Aucun livre ne correspond à votre recherche.</InsetText>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table caption="Catalogue" head={catalogueHead} rows={catalogueRows} />
              </div>
            )}
          </section>
        </div>

        <aside className="lpv-t-dashboard-page__aside">
          <div className="lpv-t-dashboard-page__aside-card">
            <h3 className="lpv-t-dashboard-page__aside-card__title">Rappels à venir</h3>
            {rappels.length === 0 ? (
              <p className="lpv-muted">Aucun rappel pour les prochains jours.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0.625rem' }}>
                {rappels.map((pret) => (
                  <AlertCard
                    accent="blue"
                    icon={false}
                    key={pret.id}
                    titre={pret.eleveLabel ?? 'Élève'}
                  >
                    &laquo; {pret.livreLabel ?? pret.exemplaireCode} &raquo; — retour prévu le{' '}
                    {formatDate(pret.dateRetourPrevue)}
                  </AlertCard>
                ))}
              </div>
            )}
          </div>
          {peutGerer ? (
            <div className="lpv-t-dashboard-page__aside-card">
              <h3 className="lpv-t-dashboard-page__aside-card__title">Ajouter un livre</h3>
              <p className="lpv-muted" style={{ marginTop: 0 }}>
                Nouvel ouvrage à référencer au catalogue.
              </p>
              <Button href="/profs/bibliotheque/livres/nouveau" variant="secondary">
                + Nouveau livre
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </>
  )
}

export { CATEGORIE_LABELS, formatDate }