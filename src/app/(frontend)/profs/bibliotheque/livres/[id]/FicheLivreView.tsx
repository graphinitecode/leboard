'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BackLink, InsetText, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { AlertCard, Table, Toast } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { DetailPage } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import {
  estPretEnCours,
  joursDeRetard,
  useListCatalogue,
  useListPretsParLivre,
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

export interface FicheLivreProps {
  livreId: number
  peutGerer: boolean
}

// Fiche livre alignée sur la maquette « Fiche livre GOV.UK » :
// stats (niveau, dispos, retard), historique des emprunts en table,
// sidebar Actions / Retard en cours / Informations.
// Les actions ne sont affichées qu'aux rôles qui peuvent gérer la
// bibliothèque (admin, bénévole) ; les profs voient la fiche en lecture seule.
export default function FicheLivreView({ livreId, peutGerer }: FicheLivreProps) {
  const catalogue = useListCatalogue()
  const prets = useListPretsParLivre(livreId)
  const marquerRetourne = useMarquerRetourne()
  const [erreur, setErreur] = useState<string | null>(null)
  const [retourMarque, setRetourMarque] = useState(false)

  const livre = (catalogue.data ?? []).find((l) => l.id === livreId)

  if (catalogue.isLoading) {
    return <p className="lpv-muted">Chargement du livre…</p>
  }

  if (!livre) {
    return (
      <>
        <BackLink href="/profs/bibliotheque">Retour au catalogue</BackLink>
        <InsetText>Livre introuvable ou retiré du catalogue.</InsetText>
      </>
    )
  }

  const enCours = (prets.data ?? []).filter(estPretEnCours)
  const disponibles = livre.exemplaires.filter((ex) => ex.disponible).length
  const totalExemplaires = livre.exemplaires.length
  const retardMax = Math.max(0, ...enCours.map((pret) => joursDeRetard(pret.dateRetourPrevue)))
  const pretEnRetard = enCours.find((pret) => joursDeRetard(pret.dateRetourPrevue) > 0) ?? null

  const head: TableHeadCell[] = [
    { text: 'Élève' },
    { text: 'Emprunté le' },
    { text: 'Retour' },
    { text: 'Statut' },
  ]

  const rows: TableRowCell[][] = (prets.data ?? []).map((pret) => {
    const retard = estPretEnCours(pret) && joursDeRetard(pret.dateRetourPrevue) > 0
    const statut = retard
      ? { color: 'red' as const, label: 'En retard' }
      : estPretEnCours(pret)
        ? { color: 'blue' as const, label: 'En cours' }
        : { color: 'green' as const, label: 'Rendu' }
    return [
      { text: pret.eleveLabel ?? '—' },
      { text: formatDate(pret.dateEmprunt) },
      { text: pret.dateRetourEffective ? formatDate(pret.dateRetourEffective) : '—' },
      { content: <Tag color={statut.color}>{statut.label}</Tag> },
    ]
  })

  async function retourner(pretId: number) {
    setErreur(null)
    try {
      await marquerRetourne.mutateAsync(pretId)
      setRetourMarque(true)
    } catch {
      setErreur('Impossible de marquer le retour. Réessayez.')
    }
  }

  const sidebar = (
    <>
      {peutGerer ? (
        <div className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Actions</h3>
          <div className="lpv-t-dashboard-page__aside-card__actions">
            <Button href="/profs/bibliotheque/prets/nouveau" variant="success">
              Enregistrer un prêt
            </Button>
            {enCours.length > 0 ? (
              <Button
                disabled={marquerRetourne.isPending}
                onClick={() => {
                  const pret = enCours[0]
                  if (pret) retourner(pret.id)
                }}
                type="button"
                variant="secondary"
              >
                Marquer un retour
              </Button>
            ) : (
              <Button disabled variant="secondary">
                Marquer un retour
              </Button>
            )}
            <Button
              href={`/profs/bibliotheque/livres/${livre.id}/modifier`}
              variant="secondary"
            >
              Modifier la fiche
            </Button>
          </div>
        </div>
      ) : null}
      {pretEnRetard ? (
        <div className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Retard en cours</h3>
          <AlertCard accent="red" icon={false} titre={pretEnRetard.eleveLabel ?? 'Élève'}>
            Retour prévu le {formatDate(pretEnRetard.dateRetourPrevue)}
          </AlertCard>
        </div>
      ) : null}
      <div className="lpv-t-dashboard-page__aside-card">
        <h3 className="lpv-t-dashboard-page__aside-card__title">Informations</h3>
        <dl className="lpv-m-infolist">
          <dt>Catégorie</dt>
          <dd>{livre.categorie ? CATEGORIE_LABELS[livre.categorie] ?? livre.categorie : '—'}</dd>
          <dt>ISBN</dt>
          <dd>{livre.isbn ?? '—'}</dd>
          <dt>Exemplaires</dt>
          <dd>{totalExemplaires}</dd>
          <dt>Ajouté au catalogue</dt>
          <dd>
            {new Date(String(livre.createdAt)).toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </dd>
        </dl>
      </div>
      {peutGerer ? (
        <p className="lpv-muted">
          Les exemplaires physiques se gèrent dans <Link className="lpv-link-inline" href="/admin">le panneau d&apos;administration</Link>.
        </p>
      ) : null}
    </>
  )

  const stats: DashboardStat[] = [
    {
      label: 'Niveau conseillé',
      value: livre.niveau ? NIVEAU_LABELS[livre.niveau] ?? livre.niveau : '—',
    },
    {
      label: 'Exemplaires disponibles',
      type: disponibles > 0 ? 'success' : undefined,
      value: `${disponibles} / ${totalExemplaires}`,
    },
    {
      label: "Retard sur l'exemplaire emprunté",
      type: retardMax > 0 ? 'alert' : undefined,
      value: retardMax > 0 ? `${retardMax} jours` : '—',
    },
  ]

  return (
    <>
      {(erreur || prets.isError) && (
        <InsetText>
          {erreur ?? 'Impossible de charger les emprunts. Rechargez la page ou réessayez plus tard.'}
        </InsetText>
      )}
      {retourMarque && (
        <Toast message="Retour marqué" type="success" onClose={() => setRetourMarque(false)} />
      )}

      <DetailPage
        backHref="/profs/bibliotheque"
        backLabel="Retour au catalogue"
        title={livre.titre}
        caption={livre.auteur ?? ''}
        tag={
          <Tag color={disponibles > 0 ? 'green' : 'red'}>
            {disponibles > 0 ? 'Disponible' : 'Emprunté'}
          </Tag>
        }
        stats={stats}
        sections={[
          {
            title: 'Résumé',
            children: livre.resume ? (
              <p>{livre.resume}</p>
            ) : (
              <p className="lpv-muted">Aucun résumé pour le moment.</p>
            ),
          },
          {
            title: 'Historique des emprunts',
            children:
              prets.isLoading ? (
                <p className="lpv-muted">Chargement des emprunts…</p>
              ) : (prets.data ?? []).length === 0 ? (
                <InsetText>Aucun emprunt enregistré pour ce livre.</InsetText>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <Table caption="Emprunts" head={head} rows={rows} />
                </div>
              ),
          },
        ]}
        sidebar={sidebar}
      />
    </>
  )
}