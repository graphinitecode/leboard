import { ReinitialiserMotDePasseForm } from '@/components/organisms/o-reinitialiser-mot-de-passe-form'
import { FormPage } from '@/components/templates'

export const metadata = { title: 'Nouveau mot de passe — LPV Board' }
export const dynamic = 'force-dynamic'

// Page publique : pose du nouveau mot de passe avec le token du lien reçu.
export default async function ReinitialiserMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <FormPage
      subtitle="Choisissez votre nouveau mot de passe."
      title="Nouveau mot de passe"
    >
      <ReinitialiserMotDePasseForm tokenInitial={token ?? ''} />
    </FormPage>
  )
}