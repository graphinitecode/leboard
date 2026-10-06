'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button, InsetText } from '@/components/atoms'
import { MotDePasseOublieForm } from '@/components/organisms/o-mot-de-passe-oublie-form'
import { FormPage } from '@/components/templates'

// Parcours « mot de passe oublié » : saisie de l'e-mail, puis confirmation
// d'envoi. La réponse est la même qu'un compte existe ou non (pas
// d'énumération des comptes).
export default function MotDePasseOublieView({ portail }: { portail: 'profs' | 'parents' }) {
  const lienConnexion = `/${portail}/login`
  const [envoyeA, setEnvoyeA] = useState<string | null>(null)

  if (envoyeA === null) {
    return (
      <FormPage
        retour={{ href: lienConnexion, label: 'Retour à la connexion' }}
        title="Réinitialiser votre mot de passe"
      >
        <MotDePasseOublieForm onEnvoye={setEnvoyeA} />
      </FormPage>
    )
  }

  return (
    <FormPage title="Consultez vos e-mails">
      <p className="lpv-muted pt-7 pb-2">
        Si l&#39;adresse e-mail <span className="font-semibold">{envoyeA}</span> est associée à un
        compte, un lien de réinitialisation vient d&apos;être envoyé.
      </p>
      <InsetText>
        Le lien est <span className="font-semibold">valable 2 heures.</span> Pensez à regarder dans
        vos courriers indésirables.
      </InsetText>
      <p className="lpv-muted mt-7 pb-7">
        Toujours rien ?{' '}
        <Link className="lpv-link-inline" href="mailto:support@lespierresvivantes.org">
          Contacter le support
        </Link>
        .
      </p>
      <Button href={lienConnexion} variant="primary">
        Revenir à la connexion
      </Button>
    </FormPage>
  )
}
