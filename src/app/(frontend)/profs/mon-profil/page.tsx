import { requireProf } from '@/utilities/profAuth'
import { MonProfilForm } from '@/components/organisms/o-mon-profil-form'
import { BackLink } from '@/components/atoms/a-back-link'

import { FormPage } from '@/components/templates'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mon profil — LPV Board' }

export default async function MonProfilProfsPage() {
  const user = await requireProf()

  return (
    <FormPage title="Mon profil" subtitle="Modifiez vos informations personnelles.">
      <BackLink href="/profs">Retour au tableau de bord</BackLink>
      <MonProfilForm
        portail="profs"
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