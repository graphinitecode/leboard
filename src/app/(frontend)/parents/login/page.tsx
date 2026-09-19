import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/organisms/LoginForm'
import { getMeUserServer } from '@/utilities/parentAuth'

export const dynamic = 'force-dynamic'

// La page hérite de l'entête bleue du layout /parents.
export default async function LoginPage() {
  const user = await getMeUserServer()
  if (user?.role === 'parent') {
    redirect('/parents')
  }

  return (
    <LoginForm
      cible="/parents"
      sousTitre="Connectez pour accéder à l'espace parents."
    />
  )
}