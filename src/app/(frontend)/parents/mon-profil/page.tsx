import { requireParent } from '@/utilities/parentAuth'
import { MonProfilForm } from '@/components/organisms/o-mon-profil-form'
import { BackLink } from '@/components/atoms/a-back-link'

import { FormPage } from '@/components/templates'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mon profil — LPV Board' }

export default async function MonProfilParentsPage() {
  const user = await requireParent()

  return (
    <FormPage title="Mon profil" subtitle="Modifiez vos informations personnelles.">
      <BackLink href="/parents">Retour à l&apos;accueil</BackLink>
      <MonProfilForm
        portail="parents"
        initial={{
          prenom: user.prenom,
          nom: user.nom,
          telephone: user.telephone ?? '',
          email: user.email,
        }}
      />
    </FormPage>
  )
}