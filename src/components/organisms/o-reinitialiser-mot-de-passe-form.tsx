'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms'
import { ErrorSummary, Input, NotificationBanner } from '@/components/molecules'

import { reinitialiserMotDePasse } from '@/app/(frontend)/actions/mot-de-passe'

// Étape 2 : lien reçu par e-mail (?token=...) → nouveau mot de passe.
export function ReinitialiserMotDePasseForm({
  portail = 'profs',
  tokenInitial,
}: {
  portail?: 'profs' | 'parents'
  tokenInitial: string
}) {
  const lienConnexion = `/${portail}/login`
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [succes, setSucces] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
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
      <ErrorSummary
        errors={erreur ? [{ fieldId: 'nouveau-mdp', text: erreur }] : []}
        title="Il y a un problème"
      />
      <Input
        error={erreur ?? undefined}
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
      {succes ? (
        <NotificationBanner title={message ?? ''} type="success" />
      ) : null}
      {succes ? (
        <Button className="w-full" href={lienConnexion}>
          Se connecter
        </Button>
      ) : (
        <Button className="w-full" disabled={pending} type="submit">
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