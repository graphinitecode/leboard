import { requireProf } from '@/utilities/profAuth'
import ProfsCalendrierView from './ProfsCalendrierView'

export const dynamic = 'force-dynamic'

export default async function ProfsCalendrier() {
  await requireProf()
  return <ProfsCalendrierView />
}