'use client'

import { useMemo } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { presentSeanceLigne, useListMySeances } from '@/seances'
import { useListElevesDuProf } from '@/students'
import { WeekCalendar } from '@/calendrier'
import { useListMesDisponibilites } from '@/planning'
import type { EventCalendrier } from '@/calendrier'
import { matiereFiable } from '@/calendrier/domain/calendrier.utils'

interface ProfsDashboardProps {
  profId: number
}

interface StatCard {
  value: string | number
  label: string
  detail?: string
  detailColor?: string
}

function DashboardStats({ statCards }: { statCards: StatCard[] }) {
  return (
    <div className="lpv-cards-grid lpv-cards-grid--4">
      {statCards.map((card) => (
        <div className="lpv-card lpv-stat" key={card.label}>
          <span className="lpv-stat__value">{card.value}</span>
          <div className="lpv-stat__label">{card.label}</div>
          {card.detail && (
            <div className="lpv-stat__detail" style={card.detailColor ? { color: card.detailColor } : undefined}>
              {card.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ProfsDashboard({ profId }: ProfsDashboardProps) {
  const seances = useListMySeances({ limite: 30 })
  const eleves = useListElevesDuProf(profId)

  const groupes = useMemo(() => {
    const maintenant = new Date()
    const toutes = (seances.data ?? []).map(presentSeanceLigne)

    const aVenir = toutes
      .filter((s) => s.date >= maintenant)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    const passees = toutes.filter((s) => s.date < maintenant)

    const aujourdhui = aVenir.filter((s) => s.date.toDateString() === maintenant.toDateString())
    const resteSemaine = aVenir.filter((s) => s.date.toDateString() !== maintenant.toDateString())

    const retards = [...aujourdhui, ...resteSemaine, ...passees].filter((s) => !s.retourPresent).length

    return { aujourdhui, resteSemaine, passees, retards }
  }, [seances.data])

  if (seances.isLoading || eleves.isLoading) {
    return <p className="lpv-muted">Chargement du tableau de bord…</p>
  }

  const aujourdhuiCount = groupes.aujourdhui.length
  const semaineCount = aujourdhuiCount + groupes.resteSemaine.length

  return (
    <>
      <DashboardStats
        statCards={[
          {
            value: aujourdhuiCount,
            label: 'Séance(s) aujourd\u2019hui',
            detail: groupes.retards > 0 ? `${groupes.retards} retour(s) en attente` : undefined,
            detailColor: 'var(--lpv-orange)',
          },
          {
            value: semaineCount,
            label: 'Cette semaine',
            detail: aujourdhuiCount > 0 ? `dont ${aujourdhuiCount} aujourd\u2019hui` : undefined,
          },
          { value: groupes.passees.length, label: 'Passées récentes' },
          { value: eleves.data?.length ?? 0, label: 'Mes élèves' },
        ]}
      />

      <SectionCalendrier seances={seances.data ?? []} retards={groupes.retards} />

      <ListesSection title="Passées récentes" seances={groupes.passees} empty="Aucune séance à afficher." />

      <section>
        <h2 className="lpv-h2">Mes élèves ({eleves.data?.length ?? 0})</h2>
        {(eleves.data?.length ?? 0) === 0 ? (
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
        )}
      </section>
    </>
  )
}

function SectionCalendrier({
  seances,
  retards,
}: {
  seances: { id: number; date: string; matiere: string; aRetour: boolean }[]
  retards: number
}) {
  const disponibilites = useListMesDisponibilites()

  const events: EventCalendrier[] = (seances ?? []).map((seance) => ({
    id: seance.id,
    debut: new Date(seance.date),
    dureeMin: 60,
    matiere: matiereFiable(seance.matiere),
    labelGroupe: '',
    href: `/profs/seances/${seance.id}`,
  }))

  return (
    <section aria-label="Ma semaine">
      <h2 className="lpv-h2">Ma semaine</h2>
      {retards > 0 && (
        <InsetText>
          {retards} retour(s) de séance en attente d&apos;écriture.
        </InsetText>
      )}
      <WeekCalendar dispos={disponibilites.data ?? []} events={events} mode="prof" />
    </section>
  )
}

function ListesSection({
  title,
  seances,
  empty,
  dayMode,
}: {
  title: string
  seances: { id: number; date: Date; matiereLabel: string; retourPresent: boolean }[]
  empty: string
  dayMode?: boolean
}) {
  return (
    <section>
      <h2 className={dayMode ? 'lpv-card__title' : 'lpv-h2'} style={dayMode ? { marginBottom: 0 } : undefined}>
        {title}
      </h2>
      {seances.length === 0 ? (
        <InsetText>{empty}</InsetText>
      ) : (
        <div className={dayMode ? 'lpv-card__rows' : 'lpv-card lpv-card__rows'} style={dayMode ? undefined : { padding: '0.5rem 0.75rem' }}>
          {seances.map((seance) => (
            <a className="lpv-m-list-row" href={`/profs/seances/${seance.id}`} key={seance.id}>
              <span>
                <span className="lpv-chip">
                  {dayMode
                    ? seance.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    : seance.date.toLocaleDateString('fr-FR')}
                </span>{' '}
                <span className="lpv-m-list-row__title">{seance.matiereLabel}</span>
              </span>
              {!seance.retourPresent && <Tag color="orange">Retour à faire</Tag>}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
