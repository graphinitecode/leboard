'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { InsetText } from '@/components/atoms'
import { EmptyState, Toast } from '@/components/molecules'
import { AvailabilityList, trierDisponibilites, useListMesDisponibilites } from '@/planning'

export default function DisponibilitesView() {
  return (
    <Suspense fallback={null}>
      <VueDisponibilites />
    </Suspense>
  )
}

function VueDisponibilites() {
  const router = useRouter()
  const params = useSearchParams()
  const disponibilites = useListMesDisponibilites()

  // Retour du parcours dédié (?enregistre=ajout|modification) : toast dérivé
  // de l'URL, effacé à la fermeture (router.replace nettoie le paramètre).
  const enregistre = params.get('enregistre')
  const toast =
    enregistre === 'ajout' || enregistre === 'modification'
      ? {
          message: enregistre === 'ajout' ? 'Disponibilité ajoutée' : 'Disponibilité modifiée',
          type: 'success' as const,
        }
      : null

  function fermerToast() {
    router.replace('/profs/disponibilites')
  }

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={fermerToast} />}
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
          <EmptyState
            description="Ajoutez votre premier créneau ci-dessous : l'association l'utilise pour planifier vos séances."
            icon="rivet-icons:calendar"
            title="Aucune disponibilité déclarée"
            variant="warning"
          />
        ) : (
          <AvailabilityList dispos={dispos} />
        )}
      </section>
    </>
  )
}