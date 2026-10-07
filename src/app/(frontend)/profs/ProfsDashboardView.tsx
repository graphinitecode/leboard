'use client'

import { useMemo } from 'react'

import { Details, InsetText, Tag } from '@/components/atoms'
import { ActionRow, AlertCard, MonthCalendarCard } from '@/components/molecules'
import { DashboardPage } from '@/components/templates'
import { presentSeanceLigne, useListMySeances } from '@/seances'
import type { MarqueurJourCalendrier } from '@/calendrier'
import { ActionIconcard } from '@/components/molecules/m-action-iconcard'

interface ProfsDashboardProps {
  nom?: string
  prenom: string
  alertes: { eleveId: number; eleveLabel: string; message: string }[]
}

const LIMITE_A_TRAITER = 5

export default function ProfsDashboard({ prenom, alertes }: ProfsDashboardProps) {
  const seances = useListMySeances({ limite: 60 })

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

  if (seances.isLoading) {
    return <p className="lpv-muted">Chargement du tableau de bord…</p>
  }

  const seancesSemaine = groupes.aVenir.filter(
    (s) => s.date >= semaineDebut && s.date < semaineFin,
  )

  return (
    <>
      <DashboardPage
        header={
          <>
            <h1 className="lpv-h1 mb-7">Tableau de bord</h1>
            <p
              className="lpv-muted pb-7"
              style={{
                fontSize: '1.225rem',
                paddingBottom: '1.75rem',
                fontWeight: '500',
              }}
            >
              Bonjour {prenom} 👋🏾
            </p>
          </>
        }
        sections={[
          {
            title: 'À traiter',
            children: (
              <div>
                {groupes.aTraiter.slice(0, LIMITE_A_TRAITER).map((seance) => (
                  <ActionRow
                    accent="red"
                    action={{
                      href: `/profs/seances/${seance.id}/modifier`,
                      label: 'Compléter',
                      variant: 'success',
                    }}
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
                    action={{
                      href: `/profs/seances/${seance.id}`,
                      label: 'Voir',
                      variant: 'secondary',
                    }}
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
            title: 'Historique',
            children:
              groupes.passees.length === 0 ? (
                <InsetText>Aucune séance passée.</InsetText>
              ) : (
                <Details summary={`Afficher les ${groupes.passees.length} séances précédentes`}>
                  <div className="lpv-card__rows">
                    {groupes.passees.map((seance) => (
                      <a
                        className="lpv-m-list-row"
                        href={`/profs/seances/${seance.id}`}
                        key={seance.id}
                      >
                        <span>
                          <span className="lpv-chip">{seance.dateLabel}</span>{' '}
                          <span className="lpv-m-list-row__title">{seance.matiereLabel}</span>
                        </span>
                        {!seance.retourPresent && <Tag color="orange">Retour à faire</Tag>}
                      </a>
                    ))}
                  </div>
                </Details>
              ),
          },
        ]}
        sidebar={
          <>
            <div className="">
              <MonthCalendarCard
                marqueurs={marqueurs}
                mois={new Date()}
                renduDetailJour={(jour) => (
                  <DetailJour jour={jour} seancesParJour={seancesParJour} />
                )}
                voirToutHref="/profs/calendrier"
              />
            </div>
            {alertes.length > 0 && (
              <div className="lpv-t-dashboard-page__aside-card">
                <h3 className="lpv-t-dashboard-page__aside-card__title">Alertes sur mes élèves</h3>
                <div className="lpv-t-dashboard-page__aside-card__stack">
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
              </div>
            )}

            <div className="gap-y-7 grid grid-cols-1">
              <ActionIconcard
                href="/profs/calendrier"
                title={'Ma semaine de travail'}
                icon={'rivet-icons:calendar-solid'}
                color="green"
                description="Voir la semaine et les eventuelles séances de cours"
                key="cal"
              />
              <ActionIconcard
                title={'Mes élèves'}
                href="/profs/eleves"
                icon={'rivet-icons:user-group-solid'}
                color="orange"
                description="Consulter la liste de tous les élèves."
                key="students"
              />
              <ActionIconcard
                href="/profs/disponibilites"
                title={'Mes disponibilités'}
                icon={'rivet-icons:check-all'}
                color="magenta"
                description="Consulter et gérer toutes vos disponiblités pour les cours."
                key="dispo"
              />
              <ActionIconcard
                href="/profs/bibliotheque"
                title={'La Bibliotheque'}
                icon={'rivet-icons:note-solid'}
                color="yellow"
                description="Tous les livres et support de cours disponibles."
                key="biblio"
              />
            </div>
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
          {
            label: 'Alerte(s) active(s)',
            type: alertes.length > 0 ? 'alert' : undefined,
            value: alertes.length,
          },
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
    return <p className="text-white" style={{ margin: 0 }}>Aucune séance ce jour.</p>
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
