'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/atoms/a-button'
import { Input, ErrorSummary } from '@/components/molecules'
import { useLoginParent, useLoginProf } from '@/auth/application/auth.hooks'

interface LoginFormProps {
  portail: 'profs' | 'parents'
  cible: string
  title?: string
  subtitle?: string
}

export function LoginForm({ portail, cible, title = 'Connexion', subtitle }: LoginFormProps) {
  const loginProf = useLoginProf(cible)
  const loginParent = useLoginParent(cible)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isPending = loginProf.isPending || loginParent.isPending

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const onError = (err: Error) => setError(err.message)
    if (portail === 'profs') {
      loginProf.mutate({ email, password }, { onError })
    } else {
      loginParent.mutate({ email, password }, { onError })
    }
  }

  return (
    <form className="lpv-login" onSubmit={submit}>
      <h1 className="lpv-login__title">{title}</h1>
      {subtitle ? <p className="lpv-login__subtitle">{subtitle}</p> : null}
      <ErrorSummary errors={error ? [{ fieldId: 'email', text: error }] : []} />
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
      <p className="lpv-login__forgot">
        Mot de passe oublié ? <Link href="/mot-de-passe-oublie" className="lpv-link-inline">Réinitialiser ici</Link>
      </p>
      <Button disabled={isPending} type="submit" className="w-full md:w-auto">
        {isPending ? 'Connexion…' : 'Se connecter'}
      </Button>
    </form>
  )
}
