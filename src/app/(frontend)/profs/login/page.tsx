import { LoginForm } from '@/auth'
import { FormPage } from '@/components/templates'

export const dynamic = 'force-dynamic'

// La page hérite de l'entête bleue du layout /profs.
// Le formulaire de connexion est centré sous le hero.
export default function ProfLoginPage() {
  return (
    <FormPage subtitle="Connectez pour accéder à votre espace de professeur." title="Connexion">
      <LoginForm cible="/profs" portail="profs" />
    </FormPage>
  )
}