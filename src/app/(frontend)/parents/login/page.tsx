import { redirect } from 'next/navigation'

import { getMeUserServer } from '@/utilities/parentAuth'

import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const user = await getMeUserServer()
  if (user?.role === 'parent') {
    redirect('/parents')
  }

  return <LoginForm />
}