import { MotDePasseOublieForm } from '@/components/organisms/o-mot-de-passe-oublie-form'
import { FormPage } from '@/components/templates'

export const metadata = { title: 'Mot de passe oublié — LPV Board' }

// Page publique : demande d'un lien de réinitialisation (parents, profs, bénévoles).
export default function MotDePasseOubliePage() {
  return (
    <FormPage
      subtitle="Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation."
      title="Mot de passe oublié"
    >
      <MotDePasseOublieForm />
    </FormPage>
  )
}