'use client'

import { BackLink, Tag } from '@/components/atoms'
import { FormRetour } from '@/seances'
import { TogglePresence } from '@/seances'
import { FormProgression } from '@/progressions'
import { useGetSeance } from '@/seances'
import { presentSeanceDetail } from '@/seances'
import { nomEleve } from '@/students'

interface SeanceProfViewProps {
  seanceId: number
}

export default function SeanceProfView({ seanceId }: SeanceProfViewProps) {
  const { data: detail, isLoading } = useGetSeance(seanceId)

  if (isLoading) {
    return <p className="lpv-muted">Chargement de la séance…</p>
  }

  if (!detail) {
    return (
      <>
        <BackLink href="/profs">Tableau de bord</BackLink>
        <p className="lpv-muted">Séance introuvable ou accès refusé.</p>
      </>
    )
  }

  const viewModel = presentSeanceDetail(detail)

  return (
    <>
      <BackLink href="/profs">Tableau de bord</BackLink>
      <h1 className="lpv-h1">
        {viewModel.seance.dateLabel} <Tag couleur="bleu">{viewModel.seance.matiereLabel}</Tag>
      </h1>

      <section>
        <h2 className="lpv-h2">Présences</h2>
        {!viewModel.aEleves ? (
          <p className="lpv-muted">Aucun élève inscrit sur cette séance.</p>
        ) : (
          <div>
            {viewModel.presences.map((presence) => (
              <div className="lpv-ligne" key={presence.eleveId}>
                <span>
                  <a
                    href={`/profs/eleves/${presence.eleveId}`}
                    style={{ color: 'var(--lpv-portail-dark)', fontWeight: 700 }}
                  >
                    {presence.eleveNom}
                  </a>
                </span>
                {presence.presenceId !== null && presence.statutInitial !== null ? (
                  <TogglePresence
                    nomEleve={presence.eleveNom}
                    presenceId={presence.presenceId}
                    statutInitial={presence.statutInitial}
                  />
                ) : (
                  <span className="lpv-muted">Présence non initialisée</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="lpv-h2">Retour de séance</h2>
        <FormRetour initial={detail.seance.retourTexte} seanceId={seanceId} />
      </section>

      <section>
        <h2 className="lpv-h2">Progressions</h2>
        <FormProgression
          eleves={detail.elevesDuGroupe.map((eleve) => ({
            id: eleve.id,
            label: nomEleve(eleve),
          }))}
          seanceId={seanceId}
        />
      </section>
    </>
  )
}
