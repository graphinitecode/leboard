import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/organisms/LoginForm'
import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'
import { getMeUserServer } from '@/utilities/parentAuth'


export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getMeUserServer()
  if (user?.role === 'parent') {
    redirect('/parents')
  }

  return (
    <ContenuPage
      entete={
        <EnteteService
          heroTexte="Connectez pour accéder à l'espace parents."
          heroTitre="Espace parents"
          legales={[
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
            { href: '/rgpd', libelle: 'Politique générale' },
          ]}
          services={[
            { href: '/parents', libelle: 'Espace parents' },
            { href: '/rgpd', libelle: 'Protection des données' },
          ]}
        />
      }
      liensPied={[]}
    >
      <LoginForm
        cible="/parents"
        sousTitre="Connectez pour accéder à l'espace parents."
      />
    </ContenuPage>
  )
}