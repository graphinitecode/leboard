'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Input } from '@/components/molecules'

import { demanderReinitialisation } from '@/app/(frontend)/actions/mot-de-passe'

// Étape 1 : saisie de l'e-mail → envoi du lien par e-mail (Resend).
export function MotDePasseOublieForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    setMessage(null)
    setPending(true)

    const resultat = await demanderReinitialisation(email)

    setPending(false)
    if (!resultat.ok) {
      setErreur(resultat.message)
      return
    }
    setMessage(resultat.message)
  }

  return (
    <form className="lpv-login" onSubmit={submit}>
      <Input
        autoComplete="email"
        error={erreur ?? undefined}
        hint="Un lien de réinitialisation vous sera envoyé par e-mail."
        id="email-reset"
        label="Adresse e-mail"
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        value={email}
      />
      {message ? (
        <p className="lpv-muted" role="status">
          {message}
        </p>
      ) : null}
      <Button disabled={pending} type="submit" className="w-full md:w-auto">
        {pending ? 'Envoi…' : 'Recevoir le lien'}
      </Button>
      <p>
        <Link className="lpv-link-inline" href="/profs/login">
          Retour à la connexion
        </Link>
      </p>
    </form>
  )
}