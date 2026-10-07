'use client'

import { Suspense } from 'react'

import { Button, InsetText } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { RailPage } from '@/components/templates'
import { AvailabilityList, trierDisponibilites, useListMesDisponibilites } from '@/planning'

export default function DisponibilitesView() {
  return (
    <Suspense fallback={null}>
      <VueDisponibilites />
    </Suspense>
  )
}

function VueDisponibilites() {
  const disponibilites = useListMesDisponibilites()

  const dispos = trierDisponibilites(disponibilites.data ?? [])

  if (disponibilites.isLoading) {
    return <p className="lpv-muted">Chargement de vos disponibilités…</p>
  }

  if (disponibilites.isError) {
    return (
      <>
        <h1 className="lpv-h1">Mes disponibilités</h1>
        <InsetText>
          Impossible de charger vos disponibilités. Rechargez la page ou réessayez plus tard.
        </InsetText>
      </>
    )
  }

  // Rail droit : aide sur l'usage des créneaux (sous le contenu en dessous de 80rem)
  const rail = (
    <div className="lpv-t-dashboard-page__aside-card">
      <h2 className="lpv-t-dashboard-page__aside-card__title">Comment ça marche</h2>
      <ol className="list-decimal pl-5 grid gap-2">
        <li>Déclarez les créneaux de la semaine où vous pouvez donner cours.</li>
        <li>L&apos;association s&apos;en sert pour vous proposer des séances.</li>
        <li>Les séances planifiées apparaissent dans votre calendrier.</li>
      </ol>
    </div>
  )

  return (
    <>
      <RailPage rail={rail}>
        <h1 className="lpv-h1">Mes disponibilités</h1>
        <p className="lpv-muted">
          Indiquez les créneaux hebdomadaires où vous êtes disponible : l&apos;association les
          utilise pour planifier les séances. Vous pouvez les modifier à tout moment.
        </p>

        <p>
          <Button href="/profs/disponibilites/nouvelle">Ajouter un créneau</Button>
        </p>

        <section aria-labelledby="liste-dispos">
          <h2 className="lpv-h2" id="liste-dispos">
            Vos créneaux
          </h2>
          {dispos.length === 0 ? (
            <EmptyState
              description="Ajoutez votre premier créneau avec le bouton « Ajouter un créneau » : l'association l'utilise pour planifier vos séances."
              icon="rivet-icons:calendar"
              title="Aucune disponibilité déclarée"
              variant="warning"
            />
          ) : (
            <AvailabilityList dispos={dispos} />
          )}
        </section>
      </RailPage>
    </>
  )
}
