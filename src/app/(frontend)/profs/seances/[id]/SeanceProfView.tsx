'use client'

import Link from 'next/link'

import { Button, InsetText, Tag } from '@/components/atoms'
import { AlertCard, EmptyState, Table, Tabs } from '@/components/molecules'
import type { TableRowCell } from '@/components/molecules'
import { DetailPage } from '@/components/templates'
import type { DashboardStat } from '@/components/templates'
import { nomEleve } from '@/students'
import {
  presentSeanceDetail,
  statutPresenceColor,
  statutPresenceLabel,
  useGetSeance,
} from '@/seances'
import {
  ProgressionForm,
  presentProgression,
  useListProgressionsParSeance,
} from '@/progressions'

interface SeanceProfViewProps {
  seanceId: number
  /** Élève mis en avant (venue depuis l'historique de présence de sa fiche). */
  eleveFocusId?: number
}

export default function SeanceProfView({ seanceId, eleveFocusId }: SeanceProfViewProps) {
  const { data: detail, isLoading } = useGetSeance(seanceId)
  const progressions = useListProgressionsParSeance({ seanceId })

  if (isLoading) {
    return <p className="lpv-muted">Chargement de la séance…</p>
  }

  if (!detail) {
    return (
      <EmptyState
        description="La séance demandée n'existe pas ou n'est pas une de vos séances."
        icon="rivet-icons:calendar-solid"
        title="Séance introuvable ou accès refusé"
        variant="info"
      />
    )
  }

  const viewModel = presentSeanceDetail(detail)
  const notesProgression = (progressions.data ?? []).map(presentProgression)

  const students = detail.elevesDuGroupe.map((eleve) => ({
    id: eleve.id,
    label: nomEleve(eleve),
  }))

  const presencesRows: TableRowCell[][] = viewModel.presences.map((presence, index) => [
    {
      // Numéro d'ordre pour compter facilement les élèves de la séance.
      text: String(index + 1),
    },
    {
      content: (
        <Link className="lpv-link-inline" href={`/profs/eleves/${presence.eleveId}`}>
          <strong>{presence.eleveNom}</strong>
        </Link>
      ),
    },
    {
      content:
        presence.statutInitial !== null ? (
          <Tag color={statutPresenceColor(presence.statutInitial)}>
            {statutPresenceLabel(presence.statutInitial)}
          </Tag>
        ) : (
          <span className="lpv-muted">Non initialisée</span>
        ),
    },
  ])

  const notesProgressionContenu =
    notesProgression.length === 0 ? (
      <ProgressionForm
        renderTrigger={(ouvrir) => (
          <EmptyState
            actions={[{ label: 'Ajouter une progression', onClick: ouvrir, variant: "secondary" }]}
            compact
            description="Notez les acquis et points à revoir des élèves, pendant ou après la séance."
            icon="rivet-icons:note"
            title="Aucune note de progression pour cette séance"
            variant="neutral"
          />
        )}
        seanceId={seanceId}
        students={students}
      />
    ) : (
      viewModel.aEleves ? (
        <>
          <div className="lpv-m-progression-list">
            {notesProgression.map((progression) => (
              <article
                className={`lpv-m-progression-card lpv-m-progression-card--${progression.niveau}`}
                key={progression.id}
              >
                <p className="lpv-m-progression-card__title">
                  {progression.eleveNom ? `${progression.eleveNom} — ` : ''}
                  {progression.competenceLabel} : {progression.niveauLabel}
                </p>
                <div className="lpv-m-progression-card__meta">Ajoutée le {progression.dateLabel}</div>
                {progression.commentaire ? (
                  <p className="lpv-m-progression-card__comment">{progression.commentaire}</p>
                ) : null}
              </article>
            ))}
          </div>
          <ProgressionForm seanceId={seanceId} students={students} />
        </>
      ) : (
        <div className="lpv-m-progression-list">
          {notesProgression.map((progression) => (
            <article
              className={`lpv-m-progression-card lpv-m-progression-card--${progression.niveau}`}
              key={progression.id}
            >
              <p className="lpv-m-progression-card__title">
                {progression.eleveNom ? `${progression.eleveNom} — ` : ''}
                {progression.competenceLabel} : {progression.niveauLabel}
              </p>
              <div className="lpv-m-progression-card__meta">Ajoutée le {progression.dateLabel}</div>
              {progression.commentaire ? (
                <p className="lpv-m-progression-card__comment">{progression.commentaire}</p>
              ) : null}
            </article>
          ))}
        </div>
      )
    )

  // Suivi de l'élève venu de sa fiche : statut, motif et notes de la séance.
  const presenceFocus = viewModel.presences.find((presence) => presence.eleveId === eleveFocusId)
  const notesFocus = notesProgression.filter((progression) => progression.eleveId === eleveFocusId)
  const sectionFocus = presenceFocus
    ? {
        title: `Suivi de ${presenceFocus.eleveNom}`,
        children: (
          <>
            <dl className="lpv-m-infolist">
              <dt>Statut</dt>
              <dd>
                {presenceFocus.statutInitial !== null ? (
                  <Tag color={statutPresenceColor(presenceFocus.statutInitial)}>
                    {statutPresenceLabel(presenceFocus.statutInitial)}
                  </Tag>
                ) : (
                  <span className="lpv-muted">Non initialisée</span>
                )}
              </dd>
              {presenceFocus.commentaire ? (
                <>
                  <dt>Motif</dt>
                  <dd>{presenceFocus.commentaire}</dd>
                </>
              ) : null}
            </dl>
            {notesFocus.length > 0 ? (
              <div className="lpv-m-progression-list">
                {notesFocus.map((progression) => (
                  <article
                    className={`lpv-m-progression-card lpv-m-progression-card--${progression.niveau}`}
                    key={progression.id}
                  >
                    <p className="lpv-m-progression-card__title">
                      {progression.competenceLabel} : {progression.niveauLabel}
                    </p>
                    <div className="lpv-m-progression-card__meta">Ajoutée le {progression.dateLabel}</div>
                    {progression.commentaire ? (
                      <p className="lpv-m-progression-card__comment">{progression.commentaire}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="lpv-muted">Aucune note de progression pour cet élève sur cette séance.</p>
            )}
          </>
        ),
      }
    : null

  const stats: DashboardStat[] = [
    {
      label: 'Élèves présents',
      type: 'success',
      value: `${viewModel.nbPresents} / ${viewModel.totalEleves}`,
    },
    {
      label: 'Absents',
      type: viewModel.nbAbsents > 0 ? 'alert' : undefined,
      value: viewModel.nbAbsents,
    },
    {
      detail: notesProgression.length > 0 ? 'relevées pendant la séance' : undefined,
      label: 'Notes de progression ajoutées',
      value: notesProgression.length,
    },
  ]

  const elevesAbsents = viewModel.presences.filter(
    (presence) => presence.statutInitial !== null && presence.statutInitial !== 'present',
  )

  const sidebar = (
    <>
      <div
        className={`lpv-t-dashboard-page__aside-color-card${viewModel.seance.retourPresent ? ' lpv-t-dashboard-page__aside-color-card--complete' : ' lpv-t-dashboard-page__aside-color-card--pending'}`}
      >
        <h3 className="lpv-t-dashboard-page__aside-color-card__title">Informations</h3>
        <dl className="lpv-m-infolist">
          <dt>Élèves</dt>
          <dd>{viewModel.totalEleves}</dd>
          {viewModel.groupeLabel ? (
            <>
              <dt>Groupe</dt>
              <dd>{viewModel.groupeLabel}</dd>
            </>
          ) : null}
          <dt>Matière</dt>
          <dd>{viewModel.seance.matiereLabel}</dd>
          {viewModel.seance.profLabel ? (
            <>
              <dt>Prof</dt>
              <dd>{viewModel.seance.profLabel}</dd>
            </>
          ) : null}
          <dt>Durée</dt>
          <dd>{viewModel.seance.creneauLabel}</dd>
          {viewModel.seance.repetitionLabel ? (
            <>
              <dt>Répétition</dt>
              <dd>{viewModel.seance.repetitionLabel}</dd>
            </>
          ) : null}
          <dt>Retour</dt>
          <dd>
            <Tag color={viewModel.seance.retourPresent ? 'green' : 'orange'}>
              {viewModel.seance.retourPresent ? 'Retour complété' : 'Retour en attente'}
            </Tag>
          </dd>
        </dl>
      </div>

      <div className="lpv-t-dashboard-page__aside-card">
        <h3 className="lpv-t-dashboard-page__aside-card__title">Modifier cette séance</h3>
        <p className="lpv-t-dashboard-page__aside-card__empty-text">
          {viewModel.seance.retourPresent
            ? 'Le retour de séance est visible par les parents de l’élève.'
            : 'Le retour de séance est en attente : il sera visible par les parents.'}
        </p>
        <div className="lpv-t-dashboard-page__aside-card__actions">
          {/* Page entière de complétion (retour + présences) : même pattern
              que livres/[id]/modifier — la fiche reste en lecture seule. */}
          <Button href={`/profs/seances/${seanceId}/modifier`} variant="success">
            {viewModel.seance.retourPresent ? 'Modifier le retour' : 'Compléter le retour'}
          </Button>
        </div>
      </div>

      {/* Suppression ouverte aux profs pour les séances d'une série (une
          séance ponctuelle reste supprimable par l'administration seule) */}
      {viewModel.seance.repetitionLabel ? (
        <div className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Séance récurrente</h3>
          <p className="lpv-t-dashboard-page__aside-card__empty-text">
            Supprimer cette séance, les suivantes ou toute la série.
          </p>
          <div className="lpv-t-dashboard-page__aside-card__actions">
            <Button href={`/profs/seances/${seanceId}/supprimer`} variant="danger">
              Supprimer
            </Button>
          </div>
        </div>
      ) : null}

      {elevesAbsents.length > 0 && (
        <div className="lpv-t-dashboard-page__aside-card">
          <h3 className="lpv-t-dashboard-page__aside-card__title">Élèves absents</h3>
          <div className="lpv-t-dashboard-page__aside-card__stack">
            {elevesAbsents.map((absent) => (
              <AlertCard
                href={`/profs/eleves/${absent.eleveId}`}
                hrefLabel="Voir sa fiche"
                key={absent.eleveId}
                titre={absent.eleveNom}
              >
                {absent.statutInitial === 'absent-justifie'
                  ? 'Absence justifiée pour cette séance.'
                  : 'Marqué absent pour cette séance.'}
              </AlertCard>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <DetailPage
      backHref={presenceFocus ? `/profs/eleves/${presenceFocus.eleveId}` : '/profs'}
      backLabel={presenceFocus ? `Fiche de ${presenceFocus.eleveNom}` : 'Mes séances'}
      caption={
        viewModel.seance.profLabel
          ? `${viewModel.seance.dateLongueLabel}, ${viewModel.seance.heureLabel} — ${viewModel.seance.profLabel}`
          : `${viewModel.seance.dateLongueLabel}, ${viewModel.seance.heureLabel}`
      }
      sections={[
        ...(sectionFocus ? [sectionFocus] : []),
        {
          title: 'Retour de séance',
          children:
            viewModel.seance.retourPresent ? (
              <InsetText>
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{detail.seance.retourTexte}</p>
              </InsetText>
            ) : (
              <EmptyState
                compact
                description="Complétez-le via « Compléter le retour » à droite — il sera visible par les parents."
                icon="rivet-icons:chat"
                title="Aucun retour"
                variant="neutral"
              />
            ),
        },
        {
          title: 'Suivi de la séance',
          children: (
            <Tabs
              id={`suivi-seance-${seanceId}`}
              tabs={[
                {
                  content:
                    !viewModel.aEleves ? (
                      <EmptyState
                        compact
                        icon="rivet-icons:user-group"
                        title="Aucun élève inscrit sur cette séance"
                        variant="neutral"
                      />
                    ) : (
                      <Table
                        caption="Élèves de la séance"
                        captionSize="s"
                        firstColumnHeader
                        head={[{ text: 'N°' }, { text: 'Élève' }, { text: 'Statut' }]}
                        rows={presencesRows}
                      />
                    ),
                  id: 'presences',
                  label: `Présences (${viewModel.totalEleves})`,
                },
                {
                  content: notesProgressionContenu,
                  id: 'progressions',
                  label: `Notes de progression (${notesProgression.length})`,
                },
              ]}
              title=""
            />
          ),
        },
      ]}
      sidebar={sidebar}
      stats={stats}
      tag={<Tag color="blue">{viewModel.seance.matiereLabel}</Tag>}
      title={viewModel.groupeLabel ?? viewModel.seance.matiereLabel}
    />
  )
}
