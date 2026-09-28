'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { BackLink } from '@/components/atoms/a-back-link'
import { AlertCard, Pagination, Table } from '@/components/molecules'
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
  retour: string
}

const SEUIL_SURVEILLANCE = 75
const SEUIL_SUCCES = 85
const ELEVES_PAR_PAGE = 10

// Liste « Mes élèves » alignée sur la maquette : stats, searchbar à filtres,
// table des élèves (présence, statut), pagination 10/page (molécule GOV.UK,
// page portée par l'URL ?page=N) et sidebar « À surveiller ». Données :
// module @/students + présences du module @/seances ; les alertes arrivent
// en props (chargées côté serveur, collection adminOnly).
export default function ElevesView({ profId, alertes, retour }: ElevesViewProps) {
  const eleves = useListElevesDuProf(profId)
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [recherche, setRecherche] = useState('')
  const [groupeFiltre, setGroupeFiltre] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('')

  // ?page=N (1-indexé) ; reset au changement de filtre.
  const page = Math.max(1, Number(params.get('page')) || 1)

  function hrefPage(nouvelle: number): string {
    const next = new URLSearchParams(params.toString())
    next.set('page', String(nouvelle))
    return `${pathname}?${next.toString()}`
  }

  function changerFiltre(setter: (v: string) => void, valeur: string) {
    const next = new URLSearchParams(params.toString())
    next.delete('page')
    setter(valeur)
    router.push(`${pathname}?${next.toString()}`)
  }

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

  const nbPages = Math.max(1, Math.ceil(listeFiltree.length / ELEVES_PAR_PAGE))
  const pageCourante = Math.min(page, nbPages)
  const listeAffichee = listeFiltree.slice(
    (pageCourante - 1) * ELEVES_PAR_PAGE,
    pageCourante * ELEVES_PAR_PAGE,
  )

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
      // Paliers : ≥ 85 % succès, ≥ 75 % avertissement, < 75 % alerte.
      type:
        moyenne === null
          ? undefined
          : moyenne >= SEUIL_SUCCES
            ? 'success'
            : moyenne >= SEUIL_SURVEILLANCE
              ? 'warning'
              : 'alert',
      value: moyenne !== null ? `${moyenne}%` : '—',
    },
    {
      label: 'Élèves à surveiller',
      type: nbSurveillance > 0 ? 'alert' : 'success',
      value: nbSurveillance,
    },
  ]

  const head: TableHeadCell[] = [
    { text: 'Noms & Prénoms' },
    { text: 'Groupe' },
    { text: 'Présence' },
    { text: 'Statut' },
    { text: 'Actions' },
  ]

  const rows: TableRowCell[][] = listeAffichee.map((eleve) => {
    const taux = tauxQuery.data?.get(eleve.id) ?? null
    const statut = statutEleve(eleve.id, taux)
    const bas = taux !== null && taux < SEUIL_SURVEILLANCE
    return [
      { content: <strong>{nomEleve(eleve)}</strong> },
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
      {
        content: <Link href={`/profs/eleves/${eleve.id}`}>Voir</Link>,
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
      <BackLink href={retour}>
        {retour === '/profs' ? 'Retour au tableau de bord' : 'Retour'}
      </BackLink>
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
          onChange={(e) => changerFiltre(setGroupeFiltre, e.target.value)}
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
          onChange={(e) => changerFiltre(setStatutFiltre, e.target.value)}
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
                {nbPages > 1 ? (
                  <Pagination
                    ariaLabel="Pagination des élèves"
                    items={itemsPagination(nbPages, pageCourante, hrefPage)}
                  />
                ) : null}
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
// URLs ?page=N (filtres préservés) pour la molécule Pagination GOV.UK.
// Fenêtre ±2 autour de la page courante, bornes incluses, ellipsis.
function itemsPagination(
  nbPages: number,
  pageCourante: number,
  hrefPage: (n: number) => string,
): ({ current?: boolean; href: string; number: number } | { ellipsis: true })[] {
  const items: ({ current?: boolean; href: string; number: number } | { ellipsis: true })[] = []

  const debut = Math.max(1, pageCourante - 2)
  const fin = Math.min(nbPages, pageCourante + 2)

  if (debut > 1) items.push({ href: hrefPage(1), number: 1 })
  if (debut > 2) items.push({ ellipsis: true })

  for (let n = debut; n <= fin; n += 1) {
    items.push({ current: n === pageCourante, href: hrefPage(n), number: n })
  }

  if (fin < nbPages - 1) items.push({ ellipsis: true })
  if (fin < nbPages) items.push({ href: hrefPage(nbPages), number: nbPages })

  return items
}
