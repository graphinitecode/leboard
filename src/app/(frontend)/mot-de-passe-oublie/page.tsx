import { MotDePasseOublieForm } from '@/components/organisms/o-mot-de-passe-oublie-form'

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

  return <MotDePasseOublieForm portail={portail} />
}