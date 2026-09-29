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
        <p>
          Si un compte existe pour <strong>{email.trim()}</strong>, un lien de réinitialisation vient
          d&apos;être envoyé.
        </p>
        <InsetText>
          <p className="lpv-muted">
            Le lien est valable 2 heures. Pensez à regarder dans vos courriers indésirables.
          </p>
        </InsetText>
        <p>Toujours rien ? Contactez l&apos;administration de l&apos;association.</p>
        <p>
          <Link className="lpv-link-inline" href={lienConnexion}>
            Retour à la connexion
          </Link>
        </p>
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
      <p className="lpv-login__subtitle">
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