import { LoginForm } from '@/components/organisms/LoginForm'

export const dynamic = 'force-dynamic'

export default async function ProfLoginPage() {
  return (
    <LoginForm
      cible="/profs"
      libelleService="Espace profs"
      note="Connectez-vous avec le compte fourni par l'association."
    />
  )
}