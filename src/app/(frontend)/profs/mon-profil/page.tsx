import { requireProf } from '@/utilities/profAuth'
import { MonProfilForm } from '@/components/organisms/o-mon-profil-form'

import { FormPage } from '@/components/templates'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Mon profil — LPV Board' }

export default async function MonProfilProfsPage() {
  const user = await requireProf()

  return (
    <FormPage
      retour={{ href: '/profs', label: 'Retour au tableau de bord' }}
      subtitle="Modifiez vos informations personnelles."
      title="Mon profil"
    >
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