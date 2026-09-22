'use client'

import { InsetText } from '@/components/atoms'
import { AvailabilityList, trierDisponibilites, useListMesDisponibilites } from '@/planning'

export default function DisponibilitesView() {
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

  return (
    <>
      <h1 className="lpv-h1">Mes disponibilités</h1>
      <p className="lpv-muted">
        Indiquez les créneaux hebdomadaires où vous êtes disponible : l&apos;association les
        utilise pour planifier les séances. Vous pouvez les modifier à tout moment.
      </p>

      <section aria-labelledby="liste-dispos">
        <h2 className="lpv-h2" id="liste-dispos">
          Vos créneaux
        </h2>
        {dispos.length === 0 ? (
          <InsetText>Aucune disponibilité déclarée. Ajoutez votre premier créneau ci-dessous.</InsetText>
        ) : (
          <AvailabilityList dispos={dispos} />
        )}
      </section>
    </>
  )
}