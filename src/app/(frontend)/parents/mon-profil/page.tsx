import { requireParent } from '@/utilities/parentAuth'
import { MonProfilForm } from '@/components/organisms/o-mon-profil-form'

import { FormPage } from '@/components/templates'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mon profil — LPV Board' }

export default async function MonProfilParentsPage() {
  const user = await requireParent()

  return (
    <FormPage
      retour={{ href: '/parents', label: 'Retour à l’accueil' }}
      subtitle="Modifiez vos informations personnelles."
      title="Mon profil"
    >
      <MonProfilForm
        portail="parents"
        initial={{
          prenom: user.prenom,
          nom: user.nom,
          telephone: user.telephone ?? '',
          email: user.email,
          alertesEmail: user.alertesEmail ?? true,
        }}
      />
    </FormPage>
  )
}