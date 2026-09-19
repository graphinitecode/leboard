import { redirect } from 'next/navigation'

import { getMeUserServer } from '@/utilities/profAuth'

import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function ProfLoginPage() {
  const user = await getMeUserServer()
  if (user?.role === 'prof' || user?.role === 'admin') {
    redirect('/profs')
  }

  return <LoginForm />
}