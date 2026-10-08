'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { InsetText, Panel, Tag } from '@/components/atoms'
import { RailPage } from '@/components/templates'
import { nomEleve, useListEnfantsDuParent } from '@/students'
import { progressionsRepository } from '@/progressions'
import { seancesRepository } from '@/seances'

async function chargerResume(eleveId: number) {
  const presences = await seancesRepository.listPresencesParEleve(eleveId)
  const presentes = presences.filter((p) => p.present === 'present').length
  const taux = presences.length > 0 ? Math.round((presentes / presences.length) * 100) : null

  const progressions = await progressionsRepository.listByEleve({ eleveId, limite: 3 })
  const derniere = progressions[0] ?? null

  return {
    presencesTotal: presences.length,
    taux,
    derniereProgression: derniere
      ? { competence: derniere.competenceLabel ?? '—', niveau: derniere.niveau }
      : null,
  }
}

export default function ParentsEnfantsView({ parentId }: { parentId: number }) {
  const enfants = useListEnfantsDuParent(parentId)

  if (enfants.isLoading) {
    return <p className="lpv-muted">Chargement de vos enfants…</p>
  }

  const liste = enfants.data ?? []

  if (liste.length === 0) {
    return (
      <>
        <h1 className="lpv-h1">Espace parents</h1>
        <InsetText>
          Aucun enfant n&rsquo;est relié à votre compte pour le moment. Contactez
          l&rsquo;association si cela vous semble anormal.
        </InsetText>
      </>
    )
  }

  return (
    <RailPage
      header={<h1 className="lpv-h1">Espace parents</h1>}
      rail={<ParentsRail />}
    >
      {liste.map((enfant) => (
        <ResumeEnfantCard
          eleveId={enfant.id}
          key={enfant.id}
          nomComplet={nomEleve(enfant)}
          niveau={enfant.niveau}
        />
      ))}
    </RailPage>
  )
}

// Rail droit : rappels utiles aux parents (sous le contenu en dessous de 64rem)
function ParentsRail() {
  return (
    <div className="lpv-t-dashboard-page__aside-card">
      <h2 className="lpv-t-dashboard-page__aside-card__title">À savoir</h2>
      <p>
        Vous êtes prévenu par e-mail quand un livre emprunté est à rendre ou en cas d&rsquo;absences
        répétées.
      </p>
      <p>
        <Link className="lpv-link-inline" href="/parents/mon-profil">
          Gérer ces e-mails dans Mon profil
        </Link>
      </p>
    </div>
  )
}

function ResumeEnfantCard({
  eleveId,
  nomComplet,
  niveau,
}: {
  eleveId: number
  nomComplet: string
  niveau: string
}) {
  const { data: resume, isLoading } = useQuery({
    queryKey: ['eleves', 'resume', eleveId],
    queryFn: () => chargerResume(eleveId),
  })

  return (
    <Panel>
      <h2 style={{ marginTop: 0 }}>
        {nomComplet} <Tag color="blue">{niveau}</Tag>
      </h2>
      {isLoading || !resume ? (
        <p className="lpv-muted">Chargement du résumé…</p>
      ) : (
        <>
          <p>
            Présence :{' '}
            <strong>
              {resume.taux !== null
                ? `${resume.taux}% (${resume.presencesTotal} séances)`
                : 'Aucune séance enregistrée'}
            </strong>
          </p>
          {resume.derniereProgression && (
            <p>
              Dernière progression : {resume.derniereProgression.competence} (
              {resume.derniereProgression.niveau})
            </p>
          )}
        </>
      )}
      <Link className="lpv-a-button" href={`/parents/enfants/${eleveId}`}>
        Voir le détail
      </Link>
    </Panel>
  )
}
