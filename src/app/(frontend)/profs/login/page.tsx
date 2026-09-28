import { LoginForm } from '@/auth'

export const dynamic = 'force-dynamic'

// La page hérite de l'entête bleue du layout /profs.
// Le formulaire de connexion est centré sous le hero.
export default function ProfLoginPage() {
  return (
    <LoginForm
      cible="/profs"
      portail="profs"
      subtitle="Connectez pour accéder à votre espace de professeur."
    />
  )
}