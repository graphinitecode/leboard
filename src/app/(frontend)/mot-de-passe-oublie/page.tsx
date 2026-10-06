import { ServiceHeader } from '@/components/molecules/m-service-header'
import { PortalPage } from '@/components/templates'

import MotDePasseOublieView from './MotDePasseOublieView'

export const metadata = { title: 'Mot de passe oublié — LPV Board' }
export const dynamic = 'force-dynamic'

// Page publique : demande d'un lien de réinitialisation (parents, profs, bénévoles).
// ?portail=parents oriente le « Retour à la connexion » vers le portail parents.
export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ portail?: string }>
}) {
  const { portail: portailParam } = await searchParams
  const portail = portailParam === 'parents' ? 'parents' : 'profs'

  // Shell du portail concerné (entête, pied de page) comme ses pages de connexion
  return (
    <PortalPage header={<ServiceHeader homeHref={`/${portail}`} />} portail={portail}>
      <MotDePasseOublieView portail={portail} />
    </PortalPage>
  )
}