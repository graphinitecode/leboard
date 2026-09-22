'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Input, ResumeErreurs } from '@/components/molecules'
import { useLoginParent, useLoginProf } from '@/auth/application/auth.hooks'

interface LoginFormProps {
  portail: 'prof' | 'parent'
  cible: string
  titre?: string
  sousTitre?: string
}

export function LoginForm({ portail, cible, titre = 'Connexion', sousTitre }: LoginFormProps) {
  const loginProf = useLoginProf(cible)
  const loginParent = useLoginParent(cible)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const isPending = loginProf.isPending || loginParent.isPending

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur(null)

    const onError = (err: Error) => setErreur(err.message)
    if (portail === 'prof') {
      loginProf.mutate({ email, password }, { onError })
    } else {
      loginParent.mutate({ email, password }, { onError })
    }
  }

  return (
    <form className="lpv-login" onSubmit={submit}>
      <h1 className="lpv-login__titre">{titre}</h1>
      {sousTitre ? <p className="lpv-login__sous-titre">{sousTitre}</p> : null}
      <ResumeErreurs erreurs={erreur ? [{ champId: 'email', texte: erreur }] : []} />
      <Input
        autoComplete="email"
        id="email"
        label="Adresse e-mail"
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        value={email}
      />
      <Input
        autoComplete="current-password"
        id="motdepasse"
        label="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <p className="lpv-login__oublie">
        Mot de passe oublié ? <Link href="/admin/forgot-password" className="lpv-link">Réinitialiser ici</Link>
      </p>
      <Button disabled={isPending} type="submit" className="w-full md:w-auto">
        {isPending ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  )
}
