'use client'

import Link from 'next/link'
import { useState } from 'react'

import { BackLink, Button, InsetText } from '@/components/atoms'
import { ErrorSummary, Input } from '@/components/molecules'

import { demanderReinitialisation } from '@/app/(frontend)/actions/mot-de-passe'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Étape 1 : saisie de l'e-mail → envoi du lien par e-mail (Resend).
export function MotDePasseOublieForm({ portail = 'profs' }: { portail?: 'profs' | 'parents' }) {
  const lienConnexion = `/${portail}/login`
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    const valeur = email.trim()
    if (!valeur) {
      setErreur('Saisissez votre adresse e-mail')
      return
    }
    if (!EMAIL_RE.test(valeur)) {
      setErreur("Saisissez l'adresse e-mail au format nom@exemple.fr")
      return
    }

    setErreur(null)
    setPending(true)
    const resultat = await demanderReinitialisation(valeur)
    setPending(false)

    if (!resultat.ok) {
      setErreur(resultat.message)
      return
    }
    setEnvoye(true)
  }

  if (envoye) {
    return (
      <div className="lpv-login">
        <h1 className="lpv-login__title">Consultez vos e-mails</h1>
        <p className="lpv-muted pt-7 pb-2">
          Si l&#39;adresse e-mail <span className="font-semibold">{email.trim()}</span> est associée a un compte, un lien de réinitialisation
          vient d&apos;être envoyé.
        </p>
        <InsetText>
          Le lien est <span className="font-semibold">valable 2 heures.</span> Pensez à regarder
          dans vos courriers indésirables.
        </InsetText>
        <p className="lpv-muted mt-7 pb-7">
          Toujours rien ? {' '}
          <Link href="mailto:support@lespierresvivantes.org" className="lpv-link-inline">
            Contacter le support
          </Link>.
        </p>
        <Link href={lienConnexion}>
          <Button variant="primary">Revenir à la connexion</Button>
        </Link>
      </div>
    )
  }

  return (
    <form className="lpv-login" noValidate onSubmit={submit}>
      <BackLink href={lienConnexion}>Retour à la connexion</BackLink>
      <h1 className="lpv-login__title">Réinitialiser votre mot de passe</h1>
      <ErrorSummary
        errors={erreur ? [{ fieldId: 'email', text: erreur }] : []}
        title="Il y a un problème"
      />
      <p className="lpv-login__help">
        Saisissez l&apos;adresse e-mail de votre compte. Nous vous enverrons un lien pour choisir un
        nouveau mot de passe.
      </p>
      <Input
        autoComplete="email"
        error={erreur ?? undefined}
        id="email"
        label="Adresse e-mail"
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        value={email}
      />
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? 'Envoi…' : 'Envoyer le lien'}
      </Button>
    </form>
  )
}
