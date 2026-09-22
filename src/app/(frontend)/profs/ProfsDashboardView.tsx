'use client'

import { useMemo } from 'react'

import { InsetText, Tag } from '@/components/atoms'
import { presentSeanceLigne, useListMySeances } from '@/seances'
import { useListElevesDuProf } from '@/students'

interface ProfsDashboardProps {
  profId: number
}

interface StatCard {
  valeur: string | number
  libelle: string
  detail?: string
  detailColor?: string
}

function DashboardStats({ statCards }: { statCards: StatCard[] }) {
  return (
    <div className="lpv-cards-grid lpv-cards-grid--4">
      {statCards.map((card) => (
        <div className="lpv-card lpv-stat" key={card.libelle}>
          <span className="lpv-stat__valeur">{card.valeur}</span>
          <div className="lpv-stat__libelle">{card.libelle}</div>
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
            valeur: aujourdhuiCount,
            libelle: 'Séance(s) aujourd\u2019hui',
            detail: groupes.retards > 0 ? `${groupes.retards} retour(s) en attente` : undefined,
            detailColor: 'var(--lpv-orange)',
          },
          {
            valeur: semaineCount,
            libelle: 'Cette semaine',
            detail: aujourdhuiCount > 0 ? `dont ${aujourdhuiCount} aujourd\u2019hui` : undefined,
          },
          { valeur: groupes.passees.length, libelle: 'Passées récentes' },
          { valeur: eleves.data?.length ?? 0, libelle: 'Mes élèves' },
        ]}
      />

      <ListesSection
        titre="Aujourd'hui"
        seances={groupes.aujourdhui}
        vide="Aucune séance aujourd'hui."
        modeJour
      />
      <ListesSection titre="Cette semaine" seances={groupes.resteSemaine} vide="Aucune séance à afficher." />
      <ListesSection titre="Passées récentes" seances={groupes.passees} vide="Aucune séance à afficher." />

      <section>
        <h2 className="lpv-h2">Mes élèves ({eleves.data?.length ?? 0})</h2>
        {(eleves.data?.length ?? 0) === 0 ? (
          <InsetText>Aucun élève référent.</InsetText>
        ) : (
          <div className="lpv-eleves-grid">
            {eleves.data?.map((eleve) => (
              <a className="lpv-eleve-card" href={`/profs/eleves/${eleve.id}`} key={eleve.id}>
                <span className="lpv-eleve-card__haut">
                  <span aria-hidden="true" className="lpv-avatar">
                    {`${eleve.prenom.charAt(0)}${eleve.nom.charAt(0)}`.toUpperCase()}
                  </span>
                  <span>
                    <span className="lpv-eleve-card__nom">
                      {eleve.prenom} {eleve.nom}
                    </span>
                    <br />
                    <span className="lpv-eleve-card__detail">{eleve.groupe ?? eleve.niveau}</span>
                  </span>
                </span>
                <span className="lpv-eleve-card__lien">Voir la fiche →</span>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function ListesSection({
  titre,
  seances,
  vide,
  modeJour,
}: {
  titre: string
  seances: { id: number; date: Date; matiereLabel: string; retourPresent: boolean }[]
  vide: string
  modeJour?: boolean
}) {
  return (
    <section>
      <h2 className={modeJour ? 'lpv-card__titre' : 'lpv-h2'} style={modeJour ? { marginBottom: 0 } : undefined}>
        {titre}
      </h2>
      {seances.length === 0 ? (
        <InsetText>{vide}</InsetText>
      ) : (
        <div className={modeJour ? 'lpv-card__lignes' : 'lpv-card lpv-card__lignes'} style={modeJour ? undefined : { padding: '0.5rem 0.75rem' }}>
          {seances.map((seance) => (
            <a className="lpv-ligne" href={`/profs/seances/${seance.id}`} key={seance.id}>
              <span>
                <span className="lpv-chip">
                  {modeJour
                    ? seance.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    : seance.date.toLocaleDateString('fr-FR')}
                </span>{' '}
                <span className="lpv-ligne__titre">{seance.matiereLabel}</span>
              </span>
              {!seance.retourPresent && <Tag couleur="orange">Retour à faire</Tag>}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
