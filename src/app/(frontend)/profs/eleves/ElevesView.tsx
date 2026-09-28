'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { AlertCard, Table } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { StatsGrid } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import { nomEleve, useListElevesDuProf } from '@/students'
import { seancesRepository } from '@/seances'
import { useQuery } from '@tanstack/react-query'

export interface AlerteEleve {
  id: number | string
  eleveId: number
  message: string
}

export interface ElevesViewProps {
  profId: number
  alertes: AlerteEleve[]
}

const SEUIL_SURVEILLANCE = 75
const TAILLE_TRANCHE = 5

// Liste « Mes élèves » alignée sur la maquette : stats, searchbar à filtres,
// table des élèves (présence, statut), pagination par tranches et sidebar
// « À surveiller ». Données : module @/students + présences du module @/seances ;
// les alertes arrivent en props (chargées côté serveur, collection adminOnly).
export default function ElevesView({ profId, alertes }: ElevesViewProps) {
  const eleves = useListElevesDuProf(profId)
  const [recherche, setRecherche] = useState('')
  const [groupeFiltre, setGroupeFiltre] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('')
  const [tailleTranche, setTailleTranche] = useState(TAILLE_TRANCHE)

  const liste = useMemo(() => eleves.data ?? [], [eleves.data])

  // Taux de présence par élève (requêtes parallèles, volumes faibles).
  const tauxQuery = useQuery({
    queryKey: ['eleves', 'du-prof', profId, 'presences', liste.map((e) => e.id).join('-')],
    queryFn: async () => {
      const entrees = await Promise.all(
        liste.map(async (eleve) => {
          const presences = await seancesRepository
            .listPresencesParEleve(eleve.id)
            .catch(() => [])
          const presentes = presences.filter((p) => p.present === 'present').length
          const taux =
            presences.length > 0 ? Math.round((presentes / presences.length) * 100) : null
          return { eleveId: eleve.id, taux }
        }),
      )
      return new Map(entrees.map((e) => [e.eleveId, e.taux]))
    },
    enabled: liste.length > 0,
  })

  const elevesAlertes = useMemo(() => {
    const ids = new Set(alertes.map((a) => a.eleveId))
    return ids
  }, [alertes])

  const statutEleve = (eleveId: number, taux: number | null): 'surveillance' | 'regulier' => {
    if (elevesAlertes.has(eleveId)) return 'surveillance'
    if (taux !== null && taux < SEUIL_SURVEILLANCE) return 'surveillance'
    return 'regulier'
  }

  const groupes = useMemo(
    () => [...new Set(liste.map((e) => e.groupe).filter((g): g is string => Boolean(g)))],
    [liste],
  )

  const listeFiltree = useMemo(() => {
    let result = liste
    if (groupeFiltre) {
      result = result.filter((e) => e.groupe === groupeFiltre)
    }
    if (statutFiltre) {
      result = result.filter((e) =>
        statutFiltre === 'surveillance'
          ? statutEleve(e.id, tauxQuery.data?.get(e.id) ?? null) === 'surveillance'
          : statutEleve(e.id, tauxQuery.data?.get(e.id) ?? null) === 'regulier',
      )
    }
    const q = recherche.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (e) =>
          e.prenom.toLowerCase().includes(q) ||
          e.nom.toLowerCase().includes(q) ||
          nomEleve(e).toLowerCase().includes(q),
      )
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liste, groupeFiltre, statutFiltre, recherche, elevesAlertes, tauxQuery.data])

  const listeAffichee = listeFiltree.slice(0, tailleTranche)

  const moyenne = useMemo(() => {
    const taux = [...(tauxQuery.data ?? []).values()].filter((t): t is number => t !== null)
    if (taux.length === 0) return null
    return Math.round(taux.reduce((a, b) => a + b, 0) / taux.length)
  }, [tauxQuery.data])

  const nbSurveillance = useMemo(
    () =>
      liste.filter((e) => statutEleve(e.id, tauxQuery.data?.get(e.id) ?? null) === 'surveillance')
        .length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liste, elevesAlertes, tauxQuery.data],
  )

  const stats: DashboardStat[] = [
    { label: 'Élèves suivis', value: liste.length },
    {
      label: 'Présence moyenne',
      type: moyenne !== null && moyenne >= SEUIL_SURVEILLANCE ? 'success' : undefined,
      value: moyenne !== null ? `${moyenne}%` : '—',
    },
    {
      label: 'Élèves à surveiller',
      type: nbSurveillance > 0 ? 'alert' : undefined,
      value: nbSurveillance,
    },
  ]

  const head: TableHeadCell[] = [
    { text: 'Élève' },
    { text: 'Groupe' },
    { text: 'Présence' },
    { text: 'Statut' },
  ]

  const rows: TableRowCell[][] = listeAffichee.map((eleve) => {
    const taux = tauxQuery.data?.get(eleve.id) ?? null
    const statut = statutEleve(eleve.id, taux)
    const bas = taux !== null && taux < SEUIL_SURVEILLANCE
    return [
      {
        content: (
          <Link href={`/profs/eleves/${eleve.id}`}>
            <strong>{nomEleve(eleve)}</strong>
          </Link>
        ),
      },
      { text: eleve.groupe ?? '—' },
      {
        content: (
          <strong style={bas ? { color: 'var(--lpv-red)' } : undefined}>
            {taux !== null ? `${taux}%` : '—'}
          </strong>
        ),
      },
      {
        content: (
          <Tag color={statut === 'surveillance' ? 'red' : 'green'}>
            {statut === 'surveillance' ? 'À surveiller' : 'Régulier'}
          </Tag>
        ),
      },
    ]
  })

  if (eleves.isLoading) {
    return <p className="lpv-muted">Chargement de vos élèves…</p>
  }

  if (eleves.isError) {
    return (
      <>
        <h1 className="lpv-h1">Mes élèves</h1>
        <InsetText>
          Impossible de charger vos élèves. Rechargez la page ou réessayez plus tard.
        </InsetText>
      </>
    )
  }

  return (
    <>
      <h1 className="lpv-h1">Mes élèves</h1>
      <p className="lpv-muted">
        Les élèves dont vous êtes référent : présence, statut de suivi et accès aux fiches.
      </p>

      <StatsGrid stats={stats} />

      <div className="lpv-o-eleves__searchbar">
        <label className="lpv-visually-hidden" htmlFor="recherche-eleves">
          Rechercher un élève
        </label>
        <input
          className="lpv-a-input"
          id="recherche-eleves"
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un élève…"
          type="search"
          value={recherche}
        />
        <label className="lpv-visually-hidden" htmlFor="filtre-groupe">
          Filtrer par groupe
        </label>
        <select
          className="lpv-a-select"
          id="filtre-groupe"
          onChange={(e) => setGroupeFiltre(e.target.value)}
          value={groupeFiltre}
        >
          <option value="">Tous les groupes</option>
          {groupes.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <label className="lpv-visually-hidden" htmlFor="filtre-statut">
          Filtrer par statut
        </label>
        <select
          className="lpv-a-select"
          id="filtre-statut"
          onChange={(e) => setStatutFiltre(e.target.value)}
          value={statutFiltre}
        >
          <option value="">Tous les statuts</option>
          <option value="surveillance">À surveiller</option>
          <option value="regulier">Sans alerte</option>
        </select>
      </div>

      <div className="lpv-t-dashboard-page__columns">
        <div className="lpv-t-dashboard-page__main">
          <section className="lpv-t-dashboard-page__section" aria-labelledby="tous-mes-eleves">
            <h2 className="lpv-h2" id="tous-mes-eleves">
              Tous mes élèves
            </h2>
            {tauxQuery.isLoading ? (
              <p className="lpv-muted">Calcul des taux de présence…</p>
            ) : listeFiltree.length === 0 ? (
              <InsetText>
                {liste.length === 0
                  ? 'Aucun élève n’est relié à votre compte pour le moment. Contactez l’association si cela vous semble anormal.'
                  : 'Aucun élève ne correspond à votre recherche.'}
              </InsetText>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <Table caption="Élèves" head={head} rows={rows} />
                </div>
                {listeFiltree.length > listeAffichee.length ? (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <Button
                      onClick={() => setTailleTranche((t) => t + TAILLE_TRANCHE)}
                      type="button"
                      variant="secondary"
                    >
                      Afficher les suivants
                    </Button>
                  </div>
                ) : null}
                <p className="lpv-muted" style={{ textAlign: 'center' }}>
                  {listeAffichee.length} sur {listeFiltree.length} élève
                  {listeFiltree.length > 1 ? 's' : ''} affiché
                  {listeAffichee.length > 1 ? 's' : ''}
                </p>
              </>
            )}
          </section>
        </div>

        <aside className="lpv-t-dashboard-page__aside">
          <div className="lpv-t-dashboard-page__aside-card">
            <h3 className="lpv-t-dashboard-page__aside-card__title">À surveiller</h3>
            {nbSurveillance === 0 ? (
              <p className="lpv-muted">Aucun élève à surveiller pour le moment.</p>
            ) : (
              <div className="lpv-t-dashboard-page__aside-card__stack">
                {liste
                  .filter((e) => statutEleve(e.id, tauxQuery.data?.get(e.id) ?? null) === 'surveillance')
                  .map((eleve) => {
                    const alerte = alertes.find((a) => a.eleveId === eleve.id)
                    return (
                      <AlertCard
                        accent="red"
                        href={`/profs/eleves/${eleve.id}`}
                        hrefLabel="Voir la fiche"
                        icon={false}
                        key={eleve.id}
                        titre={nomEleve(eleve)}
                      >
                        {alerte?.message ??
                          `Présence : ${tauxQuery.data?.get(eleve.id) ?? '—'}%`}
                      </AlertCard>
                    )
                  })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}