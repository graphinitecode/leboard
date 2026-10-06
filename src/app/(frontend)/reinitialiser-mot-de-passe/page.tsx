import { ReinitialiserMotDePasseForm } from '@/components/organisms/o-reinitialiser-mot-de-passe-form'
import { ServiceHeader } from '@/components/molecules/m-service-header'
import { FormPage, PortalPage } from '@/components/templates'

export const metadata = { title: 'Nouveau mot de passe — LPV Board' }
export const dynamic = 'force-dynamic'

// Page publique : pose du nouveau mot de passe avec le token du lien reçu.
// ?portail=parents oriente le retour connexion vers le portail parents.
export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; portail?: string }>
}) {
  const { token, portail: portailParam } = await searchParams
  const portail = portailParam === 'parents' ? 'parents' : 'profs'

  // Shell du portail concerné (entête, pied de page) comme ses pages de connexion
  return (
    <PortalPage header={<ServiceHeader homeHref={`/${portail}`} />} portail={portail}>
      <FormPage subtitle="Choisissez votre nouveau mot de passe." title="Nouveau mot de passe">
        <ReinitialiserMotDePasseForm portail={portail} tokenInitial={token ?? ''} />
      </FormPage>
    </PortalPage>
  )
}