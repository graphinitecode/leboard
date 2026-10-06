'use client'

import { useMemo, useState } from 'react'

import { BackLink, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { EmptyState, ErrorSummary, Table, Toast } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import { StatsGrid } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import {
  estPretEnCours,
  joursAvantRetour,
  joursDeRetard,
  statutPret,
  trierParRetour,
  useListTousPretsEnCours,
  useMarquerRetourne,
} from '@/bibliotheque'
import type { Pret, StatutPret } from '@/bibliotheque'

type Filtre = '' | StatutPret

const OPTIONS_FILTRE: { label: string; value: Filtre }[] = [
  { label: 'Tous les prêts', value: '' },
  { label: 'En retard', value: 'retard' },
  { label: 'À rendre bientôt', value: 'bientot' },
  { label: 'Dans les temps', value: 'a-temps' },
]

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// Statut lisible : jamais porté par la couleur seule
function tagStatut(pret: Pret) {
  const statut = statutPret(pret)
  if (statut === 'retard') {
    const jours = joursDeRetard(pret.dateRetourPrevue)
    return <Tag color="red">{`En retard · ${jours} jour${jours > 1 ? 's' : ''}`}</Tag>
  }
  if (statut === 'bientot') {
    const jours = joursAvantRetour(pret.dateRetourPrevue) ?? 0
    return (
      <Tag color="orange">
        {jours === 0 ? 'À rendre aujourd’hui' : `À rendre sous ${jours} jour${jours > 1 ? 's' : ''}`}
      </Tag>
    )
  }
  return <Tag color="green">Dans les temps</Tag>
}

export default function PretsEnCoursView({ peutGerer }: { peutGerer: boolean }) {
  const prets = useListTousPretsEnCours()
  const marquerRetourne = useMarquerRetourne()
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('')
  const [confirmRetour, setConfirmRetour] = useState<{ pretId: number; titre: string } | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [retourne, setRetourne] = useState(false)

  const enCours = useMemo(() => trierParRetour((prets.data ?? []).filter(estPretEnCours)), [prets.data])
  const compte = (statut: StatutPret) => enCours.filter((p) => statutPret(p) === statut).length

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return enCours.filter(
      (pret) =>
        (!filtre || statutPret(pret) === filtre) &&
        (!q ||
          (pret.livreLabel ?? '').toLowerCase().includes(q) ||
          (pret.eleveLabel ?? '').toLowerCase().includes(q) ||
          (pret.exemplaireCode ?? '').toLowerCase().includes(q)),
    )
  }, [enCours, filtre, recherche])

  async function retourner(pretId: number, motDePasse?: string) {
    setErreur(null)
    if (!motDePasse) return
    try {
      await marquerRetourne.mutateAsync({ motDePasse, pretId })
      setRetourne(true)
      setConfirmRetour(null)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Impossible de marquer le prêt comme retourné. Réessayez.')
    }
  }

  const stats: DashboardStat[] = [
    { label: 'Prêts en cours', value: prets.isLoading ? '—' : enCours.length },
    { label: 'En retard', type: 'alert', value: prets.isLoading ? '—' : compte('retard') },
    { label: 'À rendre sous 3 jours', type: 'warning', value: prets.isLoading ? '—' : compte('bientot') },
  ]

  const head: TableHeadCell[] = [
    { text: 'Livre' },
    { text: 'Élève' },
    { text: 'Emprunté le' },
    { text: 'Retour prévu' },
    { text: 'Statut' },
    ...(peutGerer ? [{ text: '' }] : []),
  ]

  const rows: TableRowCell[][] = visibles.map((pret) => [
    {
      content: (
        <>
          <strong>{pret.livreLabel ?? 'Livre'}</strong>
          {pret.exemplaireCode ? <span className="lpv-muted"> · {pret.exemplaireCode}</span> : null}
        </>
      ),
    },
    { text: pret.eleveLabel ?? '—' },
    { text: formatDate(pret.dateEmprunt) },
    { text: formatDate(pret.dateRetourPrevue) },
    { content: tagStatut(pret) },
    ...(peutGerer
      ? [
          {
            content: (
              <Button
                disabled={marquerRetourne.isPending}
                onClick={() =>
                  setConfirmRetour({ pretId: pret.id, titre: pret.livreLabel ?? pret.exemplaireCode ?? 'ce livre' })
                }
                type="button"
                variant="secondary"
              >
                Marquer comme retourné
              </Button>
            ),
          },
        ]
      : []),
  ])

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <BackLink href="/profs/bibliotheque">Retour à la bibliothèque</BackLink>
      </div>
      <h1 className="lpv-h1">Prêts en cours</h1>

      {(erreur || prets.isError) && (
        <ErrorSummary errors={[erreur ?? 'Impossible de charger les prêts. Réessayez.']} />
      )}
      {retourne && <Toast message="Prêt marqué comme retourné" onClose={() => setRetourne(false)} type="success" />}

      <StatsGrid stats={stats} />

      <div className="lpv-o-bibliotheque__searchbar">
        <label className="lpv-visually-hidden" htmlFor="recherche-prets">
          Rechercher un livre ou un élève
        </label>
        <input
          className="lpv-a-input"
          id="recherche-prets"
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un livre, un élève…"
          type="search"
          value={recherche}
        />
        <label className="lpv-visually-hidden" htmlFor="filtre-statut">
          Filtrer par statut
        </label>
        <select
          className="lpv-a-select"
          id="filtre-statut"
          onChange={(e) => setFiltre(e.target.value as Filtre)}
          value={filtre}
        >
          {OPTIONS_FILTRE.map((option) => (
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

      {prets.isLoading ? (
        <p className="lpv-muted">Chargement des prêts…</p>
      ) : enCours.length === 0 ? (
        <EmptyState icon="boxicons:book" title="Aucun prêt en cours" variant="neutral" />
      ) : visibles.length === 0 ? (
        <EmptyState
          actions={[
            {
              label: 'Réinitialiser les filtres',
              onClick: () => {
                setRecherche('')
                setFiltre('')
              },
              variant: 'secondary',
            },
          ]}
          icon="boxicons:search"
          title="Aucun prêt ne correspond à ta recherche"
          variant="neutral"
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table caption="" head={head} rows={rows} />
        </div>
      )}

      {confirmRetour && (
        <ConfirmAction
          confirmLabel="Marquer comme retourné"
          description={`« ${confirmRetour.titre} » : le prêt sera clôturé et l'exemplaire redeviendra disponible. Confirmez avec votre mot de passe.`}
          error={erreur}
          onClose={() => {
            setConfirmRetour(null)
            setErreur(null)
          }}
          onConfirm={(motDePasse) => {
            void retourner(confirmRetour.pretId, motDePasse)
          }}
          pending={marquerRetourne.isPending}
          requirePassword
          title="Marquer ce prêt comme retourné ?"
        />
      )}
    </>
  )
}
