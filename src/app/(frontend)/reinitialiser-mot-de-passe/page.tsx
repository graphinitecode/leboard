import { ReinitialiserMotDePasseForm } from '@/components/organisms/o-reinitialiser-mot-de-passe-form'
import { FormPage } from '@/components/templates'

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

  return (
    <FormPage
      subtitle="Choisissez votre nouveau mot de passe."
      title="Nouveau mot de passe"
    >
      <ReinitialiserMotDePasseForm portail={portail} tokenInitial={token ?? ''} />
    </FormPage>
  )
}