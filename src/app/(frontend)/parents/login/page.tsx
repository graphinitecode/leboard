import { redirect } from 'next/navigation'

import { LoginForm } from '@/auth'
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
      portail="parents"
      subtitle="Connectez pour accéder à l'espace parents."
    />
  )
}