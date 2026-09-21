'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { InsetText, Panel, Tag } from '@/components/atoms'
import { nomEleve, useListEnfantsDuParent } from '@/eleves'
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
    <>
      <h1 className="lpv-h1">Espace parents</h1>
      {liste.map((enfant) => (
        <ResumeEnfantCard eleveId={enfant.id} key={enfant.id} nomComplet={nomEleve(enfant)} niveau={enfant.niveau} />
      ))}
    </>
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
        {nomComplet} <Tag couleur="bleu">{niveau}</Tag>
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
      <Link className="lpv-bouton" href={`/parents/enfants/${eleveId}`}>
        Voir le détail
      </Link>
    </Panel>
  )
}