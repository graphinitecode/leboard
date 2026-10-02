'use client'

import { useState } from 'react'

import { EmptyState, ListRow, NotificationBanner, Tabs } from '@/components/molecules'
import { QuestionPage } from '@/components/templates'
import {
  ReturnForm,
  presentSeanceDetail,
  useGetSeance,
} from '@/seances'
import { PresenceToggle } from '@/seances'

interface ModifierSeanceProps {
  seanceId: number
}

// Complétion / modification d'une séance (pattern GOV.UK question page) :
// un objectif par venue — ajuster les statuts de présence et écrire le
// retour (visible par les parents). La fiche de séance reste en lecture
// seule ; le dashboard « À traiter » mène ici via « Compléter ».
// Onglets : Présences / Retour de séance — les statuts se basculent au
// clic sur le toggle group, l'enregistrement du retour passe par
// ConfirmAction.
export default function ModifierSeanceView({ seanceId }: ModifierSeanceProps) {
  const { data: detail, isLoading } = useGetSeance(seanceId)
  const [retourEnregistre, setRetourEnregistre] = useState(false)

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
  const complet = viewModel.seance.retourPresent

  return (
    <QuestionPage
      question={complet ? 'Modifier la séance' : 'Compléter la séance'}
      retour={{ href: `/profs/seances/${seanceId}`, label: 'Retour à la séance' }}
    >
      <p className="lpv-muted">
        {viewModel.seance.dateLongueLabel}, {viewModel.seance.creneauLabel} —{' '}
        {viewModel.seance.matiereLabel}
        {viewModel.seance.profLabel ? ` avec ${viewModel.seance.profLabel}` : ''}
      </p>

      {retourEnregistre && <NotificationBanner title="Retour enregistré" type="success" />}

      <Tabs
        id={`modifier-seance-${seanceId}`}
        title=""
        tabs={[
          {
            content: (
              <>
                {!viewModel.aEleves ? (
                  <EmptyState
                    compact
                    icon="rivet-icons:user-group"
                    title="Aucun élève inscrit sur cette séance"
                    variant="neutral"
                  />
                ) : (
                  <div className="lpv-card lpv-o-seance-modifier">
                    <div className="lpv-card__rows">
                      {viewModel.presences.map((presence) => (
                        <ListRow
                          key={presence.eleveId}
                          title={presence.eleveNom}
                          action={
                            presence.presenceId !== null && presence.statutInitial !== null ? (
                              <PresenceToggle
                                initialStatus={presence.statutInitial}
                                presenceId={presence.presenceId}
                                seanceId={seanceId}
                                studentName={presence.eleveNom}
                              />
                            ) : (
                              <span className="lpv-muted">Non initialisée</span>
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ),
            id: 'presences',
            label: `Présences (${viewModel.totalEleves})`,
          },
          {
            content: (
              <ReturnForm
                initial={detail.seance.retourTexte}
                onAnnule={() => setRetourEnregistre(false)}
                onEnregistre={() => setRetourEnregistre(true)}
                seanceId={seanceId}
              />
            ),
            id: 'retour',
            label: 'Retour de séance',
          },
        ]}
      />
    </QuestionPage>
  )
}