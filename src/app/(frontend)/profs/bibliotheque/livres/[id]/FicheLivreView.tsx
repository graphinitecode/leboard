'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BackLink, Icon, InsetText, Tag } from '@/components/atoms'
import { Button } from '@/components/atoms/a-button'
import { AlertCard, EmptyState, Table, Toast } from '@/components/molecules'
import type { TableHeadCell, TableRowCell } from '@/components/molecules'
import { DetailPage } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import { ConfirmAction } from '@/components/organisms/o-confirm-action'
import {
  CATEGORIES_LIVRE,
  estPretEnCours,
  joursDeRetard,
  labelNiveauLivre,
  useListCatalogue,
  useListPretsParLivre,
  useMarquerRetourne,
} from '@/bibliotheque'

// Libellés de catégorie, enrichis : dérivés de la source unique domain.
const CATEGORIE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES_LIVRE.map((option) => [option.value, option.label]),
)

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
// stats (niveau, dispos, retard), historique des emprunts en table
// (nom de l'élève cliquable vers sa fiche, retour au livre via ?retour=),
// sidebar Actions / Retard en cours / Informations (dont la note sur les
// exemplaires physiques gérés côté admin).
// Les actions ne sont affichées qu'aux rôles qui peuvent gérer la
// bibliothèque (admin, bénévole) ; les profs voient la fiche en lecture
// seule. « Marquer un retour » est une action patrimoniale : confirmation
// par mot de passe (revérifié côté serveur) avant l'écriture.
export default function FicheLivreView({ livreId, peutGerer }: FicheLivreProps) {
  const catalogue = useListCatalogue()
  const prets = useListPretsParLivre(livreId)
  const marquerRetourne = useMarquerRetourne()
  const [erreur, setErreur] = useState<string | null>(null)
  const [retourMarque, setRetourMarque] = useState(false)
  const [confirmRetour, setConfirmRetour] = useState<{ pretId: number; eleve: string } | null>(
    null,
  )

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
      {
        content:
          pret.eleveId > 0 ? (
            <Link
              className="lpv-link-inline"
              href={`/profs/eleves/${pret.eleveId}?retour=/profs/bibliotheque/livres/${livreId}`}
            >
              {pret.eleveLabel ?? '—'}
            </Link>
          ) : (
            <span>{pret.eleveLabel ?? '—'}</span>
          ),
      },
      { text: formatDate(pret.dateEmprunt) },
      { text: pret.dateRetourEffective ? formatDate(pret.dateRetourEffective) : '—' },
      { content: <Tag color={statut.color}>{statut.label}</Tag> },
    ]
  })

  async function retourner(pretId: number, motDePasse?: string) {
    setErreur(null)
    if (!motDePasse) return
    try {
      await marquerRetourne.mutateAsync({ motDePasse, pretId })
      setRetourMarque(true)
      setConfirmRetour(null)
    } catch (err) {
      setErreur(
        err instanceof Error ? err.message : 'Impossible de marquer le retour. Réessayez.',
      )
    }
  }

  const sidebar = (
    <>
      {peutGerer ? (
        <div className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Faites état du prêt ou de l&#39;emprunt du livre !</h3>
          <div className="lpv-t-dashboard-page__aside-card__actions">
            <Button href="/profs/bibliotheque/prets/nouveau" variant="success">
              <Icon icon={'rivet-icons:plus-circle-solid'} size={19} />
              &nbsp;Prêter ce livre
            </Button>
            {enCours.length > 0 ? (
              <Button
                disabled={marquerRetourne.isPending}
                onClick={() => {
                  const pret = enCours[0]
                  if (pret)
                    setConfirmRetour({
                      eleve: pret.eleveLabel ?? 'cet élève',
                      pretId: pret.id,
                    })
                }}
                type="button"
                variant="primary"
              >
                Signaler un retour
              </Button>
            ) : (
              <Button disabled variant="secondary">
                Signaler un retour
              </Button>
            )}
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
      <div className="lpv-t-dashboard-page__aside-color-card">
        <h3 className="lpv-t-dashboard-page__aside-color-card__title">Informations</h3>

        {livre.imageUrl && !livre.resume ? (
          /* Pas de résumé : la couverture reste sur la carte Informations (sinon
             elle vit à côté du résumé, section homonyme — pas de doublon). */
          <div className="lpv-t-dashboard-page__aside-cover-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={`Couverture de « ${livre.titre} »`}
              className="lpv-t-dashboard-page__aside-cover"
              loading="lazy"
              src={livre.imageUrl}
            />
          </div>
        ) : null}
        <dl className="lpv-m-infolist">
          <dt>Catégorie</dt>
          <dd>{livre.categorie ? (CATEGORIE_LABELS[livre.categorie] ?? livre.categorie) : '—'}</dd>
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
        {peutGerer ? (
          <>
            <div className="flex mb-5 justify-center px-4">
              <Button
                href={`/profs/bibliotheque/livres/${livre.id}/modifier`}
                variant="tertiary"
                className="w-full"
              >
                Modifier la fiche du livre
              </Button>
            </div>
            <div className={'lpv-t-dashboard-page__aside-color-card__actions'}>
              <Icon
                icon={`rivet-icons:lock-closed-solid`}
                size={22}
                className="lpv-t-dashboard-page__aside-color-card__actions--icon"
              />
              <p className={`lpv-t-dashboard-page__aside-color-card__actions--content`}>
                les exemplaires individuels (état, notes d&apos;entretien) se gèrent dans{' '}
                <Link className="lpv-link-inline" href="/admin">
                  le panneau d&apos;administration
                </Link>
                .
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="lpv-t-dashboard-page__aside-card">
        <h3 className="lpv-t-dashboard-page__aside-card__title">Zone Dangereuse</h3>
        <div className="lpv-t-dashboard-page__aside-card__actions">
          <p className="mb-4 opacity-80">
            Cliquez sur le bouton ci-dessous pour supprimer définitivement le livre du catalogue.
          </p>
          <Button
            href={`/profs/bibliotheque/livres/${livre.id}/supprimer`}
            variant="danger"
            className="w-full"
          >
            Supprimer le livre
          </Button>
        </div>
      </div>
    </>
  )

  const stats: DashboardStat[] = [
    {
      label: 'Niveau conseillé',
      value: livre.niveau ? (labelNiveauLivre(livre.niveau) ?? livre.niveau) : '—',
    },
    {
      label: 'Exemplaires disponibles',
      type: disponibles > 0 ? 'success' : 'alert',
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
          {erreur ??
            'Impossible de charger les emprunts. Rechargez la page ou réessayez plus tard.'}
        </InsetText>
      )}
      {retourMarque && (
        <Toast message="Retour marqué" type="success" onClose={() => setRetourMarque(false)} />
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
          title="Marquer le retour du prêt ?"
        />
      ) : null}

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
            children: livre.resume && livre.imageUrl ? (
              <div className="lpv-t-dashboard-page__couverture-resume">
                {/* Couverture externe (lien web) : pas d'optimisation next/image. */}
                <div className="lpv-t-dashboard-page__aside-cover-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`Couverture de « ${livre.titre} »`}
                    className="lpv-t-dashboard-page__aside-cover"
                    loading="lazy"
                    src={livre.imageUrl}
                  />
                </div>
                <p>{livre.resume}</p>
              </div>
            ) : livre.resume ? (
              <p>{livre.resume}</p>
            ) : peutGerer ? (
              <p className="lpv-muted">
                Ce livre n&apos;a pas encore de résumé.{' '}
                <Link
                  className="lpv-link-inline"
                  href={`/profs/bibliotheque/livres/${livreId}/modifier#livre-resume`}
                >
                  Ajouter un résumé
                </Link>
                .
              </p>
            ) : (
              <p className="lpv-muted">Ce livre n&apos;a pas encore de résumé.</p>
            ),
          },
          {
            title: 'Historique des emprunts',
            children: prets.isLoading ? (
              <p className="lpv-muted">Chargement des emprunts…</p>
            ) : (prets.data ?? []).length === 0 ? (
              <EmptyState
                compact
                icon="rivet-icons:eye-off"
                title="Vu par aucun élève..."
                description={`Ce livre ${livre.titre} n'a pas encore été preté a un ou plusieurs élèves, afin d'etre lu.`}
                variant="neutral"
                actions={[
                  // bouton simple
                  // { label: 'Contacter l’association', variant: 'primary' },
                  // avec navigation (page → lien <a>)
                  {
                    label: 'Je prête ce livre',
                    href: "/profs/bibliotheque/prets/nouveau",
                    variant: 'secondary',
                  },
                ]}
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table caption="" head={head} rows={rows} />
              </div>
            ),
          },
        ]}
        sidebar={sidebar}
      />
    </>
  )
}
