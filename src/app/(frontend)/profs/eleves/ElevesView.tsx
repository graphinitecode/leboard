'use client'

import Link from 'next/link'

import { InsetText, Panel, Tag } from '@/components/atoms'
import { nomEleve, useListElevesDuProf } from '@/students'

// Liste des élèves référents du prof (fiches reliées, lecture seule).
// La donnée vient du module @/students (REST /eleves filtré par profReferent).
export default function ElevesView({ profId }: { profId: number }) {
  const eleves = useListElevesDuProf(profId)

  if (eleves.isLoading) {
    return <p className="lpv-muted">Chargement de vos élèves…</p>
  }

  if (eleves.isError) {
    return (
      <>
        <h1 className="lpv-h1">Mes élèves</h1>
        <InsetText>
          Impossible de charger vos élèves. Rechargez la page ou réessayez plus tard.
        </InsetText>
      </>
    )
  }

  const liste = eleves.data ?? []

  return (
    <>
      <h1 className="lpv-h1">Mes élèves</h1>
      <p className="lpv-muted">
        Les élèves dont vous êtes référent. La fiche détaille présences, progressions et
        retours de séance.
      </p>

      {liste.length === 0 ? (
        <InsetText>
          Aucun élève n&rsquo;est relié à votre compte pour le moment. Contactez
          l&rsquo;association si cela vous semble anormal.
        </InsetText>
      ) : (
        liste.map((eleve) => (
          <Panel key={eleve.id}>
            <h2 style={{ marginTop: 0 }}>
              {nomEleve(eleve)} <Tag color="blue">{eleve.niveau}</Tag>
            </h2>
            {eleve.groupe ? <p className="lpv-muted">Groupe : {eleve.groupe}</p> : null}
            <Link className="lpv-a-button" href={`/profs/eleves/${eleve.id}`}>
              Voir la fiche
            </Link>
          </Panel>
        ))
      )}
    </>
  )
}