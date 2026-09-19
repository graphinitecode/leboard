import { LoginForm } from '@/components/organisms/LoginForm'
import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'

import '../lpvboard.css'

export const dynamic = 'force-dynamic'

export default async function ProfLoginPage() {
  return (
    <ContenuPage
      entete={
        <EnteteService
          heroTexte="Connectez pour accéder à votre espace de professeur."
          heroTitre="Espace profs"
          legales={[
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
            { href: '/rgpd', libelle: 'Politique générale' },
          ]}
          services={[
            { href: '/profs', libelle: 'Espace professeurs' },
            { href: '/parents', libelle: 'Espace parents' },
          ]}
        />
      }
      liensPied={[]}
    >
      <LoginForm
        cible="/profs"
        sousTitre="Connectez pour accéder à votre espace de professeur."
      />
    </ContenuPage>
  )
}