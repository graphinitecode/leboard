import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/organisms/LoginForm'
import { getMeUserServer } from '@/utilities/parentAuth'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getMeUserServer()
  if (user?.role === 'parent') {
    redirect('/parents')
  }

  return (
    <LoginForm
      cible="/parents"
      libelleService="Espace parents"
      note="Vous voyez uniquement les informations concernant votre enfant."
    />
  )
}