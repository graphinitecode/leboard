'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Input } from '@/components/molecules'

import { reinitialiserMotDePasse } from '@/app/(frontend)/actions/mot-de-passe'

// Étape 2 : lien reçu par e-mail (?token=...) → nouveau mot de passe.
export function ReinitialiserMotDePasseForm({ tokenInitial }: { tokenInitial: string }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)
    setMessage(null)

    if (password !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.')
      return
    }

    setPending(true)
    const resultat = await reinitialiserMotDePasse(tokenInitial, password)
    setPending(false)

    if (!resultat.ok) {
      setErreur(resultat.message)
      return
    }
    setSucces(true)
    setMessage(resultat.message)
  }

  return (
    <form className="lpv-login" noValidate onSubmit={submit}>
      <Input
        hint="Minimum 8 caractères."
        id="nouveau-mdp"
        label="Nouveau mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <Input
        id="confirmation-mdp"
        label="Confirmer le mot de passe"
        onChange={(e) => setConfirmation(e.target.value)}
        type="password"
        value={confirmation}
      />
      {erreur ? (
        <p role="alert" style={{ color: 'var(--lpv-red, #b42318)' }}>
          {erreur}
        </p>
      ) : null}
      {message ? (
        <p className="lpv-muted" role="status">
          {message}
        </p>
      ) : null}
      {succes ? (
        <Link className="lpv-a-button" href="/profs/login">
          Se connecter
        </Link>
      ) : (
        <Button disabled={pending} type="submit" className="w-full md:w-auto">
          {pending ? 'Enregistrement…' : 'Modifier le mot de passe'}
        </Button>
      )}
      {!tokenInitial && !succes ? (
        <p className="lpv-muted">
          Vous avez ouvert cette page sans lien de réinitialisation : demandez d&apos;abord un lien
          via la page « Mot de passe oublié ».
        </p>
      ) : null}
    </form>
  )
}