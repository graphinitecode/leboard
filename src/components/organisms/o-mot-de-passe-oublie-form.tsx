'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms'
import { ErrorSummary, Input } from '@/components/molecules'

import { demanderReinitialisation } from '@/app/(frontend)/actions/mot-de-passe'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Organisme : saisie de l'e-mail → envoi du lien de réinitialisation
// (Resend). La page enchaîne sur l'écran « Consultez vos e-mails ».
export function MotDePasseOublieForm({ onEnvoye }: { onEnvoye: (email: string) => void }) {
  const [email, setEmail] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

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
    onEnvoye(valeur)
  }

  return (
    <form className="lpv-login__form" noValidate onSubmit={submit}>
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
