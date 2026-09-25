'use client'

import { useMemo } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { ActionRow, AlertCard, MonthCalendarCard } from '@/components/molecules'
import { DashboardPage } from '@/components/templates'
import { presentSeanceLigne, useListMySeances } from '@/seances'
import { useListElevesDuProf } from '@/students'
import type { MarqueurJourCalendrier } from '@/calendrier'

interface ProfsDashboardProps {
  prenom: string
  profId: number
  alertes: { eleveId: number; eleveLabel: string; message: string }[]
}

const LIMITE_A_TRAITER = 5

export default function ProfsDashboard({ prenom, profId, alertes }: ProfsDashboardProps) {
  const seances = useListMySeances({ limite: 60 })
  const eleves = useListElevesDuProf(profId)

  const groupes = useMemo(() => {
    const maintenant = new Date()
    const toutes = (seances.data ?? []).map(presentSeanceLigne)

    const passees = toutes
      .filter((s) => s.date < maintenant && s.date.toDateString() !== maintenant.toDateString())
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    const aVenir = toutes
      .filter((s) => s.date >= maintenant)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const aTraiter = passees.filter((s) => !s.retourPresent)
    const retoursEnAttente = aTraiter.length

    return { passees, aVenir, aTraiter, retoursEnAttente }
  }, [seances.data])

  const semaineDebut = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const semaineFin = useMemo(() => {
    const d = new Date(semaineDebut)
    d.setDate(d.getDate() + 7)
    return d
  }, [semaineDebut])

  const marqueurs: MarqueurJourCalendrier[] = useMemo(
    () =>
      (seances.data ?? []).map((seance) => ({
        date: new Date(seance.date),
        type: 'seance',
      })),
    [seances.data],
  )

  const seancesParJour = useMemo(() => {
    const map = new Map<string, { heure: string; label: string; id: number }[]>()
    for (const seance of (seances.data ?? []).map(presentSeanceLigne)) {
      const cle = seance.date.toDateString()
      const entrees = map.get(cle) ?? []
      entrees.push({
        heure: seance.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        id: seance.id,
        label: seance.matiereLabel,
      })
      map.set(cle, entrees)
    }
    return map
  }, [seances.data])

  if (seances.isLoading || eleves.isLoading) {
    return <p className="lpv-muted">Chargement du tableau de bord…</p>
  }

  const seancesSemaine = groupes.aVenir.filter(
    (s) => s.date >= semaineDebut && s.date < semaineFin,
  )

  return (
    <>
      <h1 className="lpv-h1">Tableau de bord</h1>
      <p className="lpv-muted" style={{ fontSize: '1.125rem' }}>
        Bonjour {prenom}
      </p>

      <DashboardPage
        sections={[
          {
            title: 'À traiter',
            children: (
              <div>
                {groupes.aTraiter.slice(0, LIMITE_A_TRAITER).map((seance) => (
                  <ActionRow
                    accent="red"
                    action={{ href: `/profs/seances/${seance.id}`, label: 'Compléter', variant: 'success' }}
                    key={seance.id}
                    meta={seance.dateLabel}
                    tag={<Tag color="orange">Retour en attente</Tag>}
                    title={seance.matiereLabel}
                  />
                ))}
                {groupes.aTraiter.length === 0 && <InsetText>Aucun retour à écrire.</InsetText>}
              </div>
            ),
          },
          {
            title: 'Séances à venir',
            children: (
              <div>
                {groupes.aVenir.slice(0, LIMITE_A_TRAITER).map((seance) => (
                  <ActionRow
                    accent="green"
                    action={{ href: `/profs/seances/${seance.id}`, label: 'Voir', variant: 'secondary' }}
                    key={seance.id}
                    meta={`${seance.dateLabel}, ${seance.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    title={seance.matiereLabel}
                  />
                ))}
                {groupes.aVenir.length === 0 && <InsetText>Aucune séance programmée.</InsetText>}
              </div>
            ),
          },
          {
            title: `Mes élèves (${eleves.data?.length ?? 0})`,
            children:
              (eleves.data?.length ?? 0) === 0 ? (
                <InsetText>Aucun élève référent.</InsetText>
              ) : (
                <div className="lpv-eleves-grid">
                  {eleves.data?.map((eleve) => (
                    <a className="lpv-eleve-card" href={`/profs/eleves/${eleve.id}`} key={eleve.id}>
                      <span className="lpv-eleve-card__top">
                        <span aria-hidden="true" className="lpv-avatar">
                          {`${eleve.prenom.charAt(0)}${eleve.nom.charAt(0)}`.toUpperCase()}
                        </span>
                        <span>
                          <span className="lpv-eleve-card__name">
                            {eleve.prenom} {eleve.nom}
                          </span>
                          <br />
                          <span className="lpv-eleve-card__detail">{eleve.groupe ?? eleve.niveau}</span>
                        </span>
                      </span>
                      <span className="lpv-eleve-card__link">Voir la fiche →</span>
                    </a>
                  ))}
                </div>
              ),
          },
        ]}
        sidebar={
          <>
            <MonthCalendarCard
              marqueurs={marqueurs}
              mois={new Date()}
              renduDetailJour={(jour) => <DetailJour jour={jour} seancesParJour={seancesParJour} />}
              voirToutHref="/profs/calendrier"
            />
            {alertes.length > 0 && (
              <div>
                {alertes.map((alerte) => (
                  <AlertCard
                    href={`/profs/eleves/${alerte.eleveId}`}
                    key={`${alerte.eleveId}-${alerte.message}`}
                    titre={`Décrochage — ${alerte.eleveLabel}`}
                  >
                    {alerte.message}
                  </AlertCard>
                ))}
              </div>
            )}
          </>
        }
        stats={[
          { label: 'Séances cette semaine', value: seancesSemaine.length },
          {
            detail: groupes.retoursEnAttente > 0 ? 'à compléter' : undefined,
            detailColor: 'var(--lpv-orange)',
            label: 'Retours en attente',
            type: 'alert',
            value: groupes.retoursEnAttente,
          },
          { label: 'Alerte(s) active(s)', type: alertes.length > 0 ? 'alert' : undefined, value: alertes.length },
        ]}
      />
    </>
  )
}

function DetailJour({
  jour,
  seancesParJour,
}: {
  jour: Date
  seancesParJour: Map<string, { heure: string; label: string; id: number }[]>
}) {
  const duJour = seancesParJour.get(jour.toDateString())
  if (!duJour || duJour.length === 0) {
    return <p className="lpv-muted" style={{ margin: 0 }}>Aucune séance ce jour.</p>
  }
  return (
    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
      {duJour.map((s) => (
        <li key={`${s.heure}-${s.id}`}>
          {s.heure} — <a href={`/profs/seances/${s.id}`}>{s.label}</a>
        </li>
      ))}
    </ul>
  )
}