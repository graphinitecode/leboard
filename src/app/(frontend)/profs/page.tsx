import { requireProf } from '@/utilities/profAuth'

import ProfsDashboardView from './ProfsDashboardView'

export const dynamic = 'force-dynamic'

export default async function ProfsDashboard() {
  const user = await requireProf()

  return <ProfsDashboardView profId={Number(user.id)} />
}