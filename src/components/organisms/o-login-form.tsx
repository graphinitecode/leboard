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

  const connexionHref = `/mot-de-passe-oublie?portail=${portail}`

  return (
    <form className="lpv-login" onSubmit={submit}>
      <h1 className="lpv-login__title">{title}</h1>
      {subtitle ? <p className="lpv-login__subtitle">{subtitle}</p> : null}
      <ul className="list-disc list-inside">
        <li className="lpv-login__forgot">
          <p>
            Mot de passe oublié ? <Link href={connexionHref}>Ré-initialiser le</Link>
          </p>
        </li>
        <li className="lpv-login__help">
          <p>
            Problèmes de connexion ? <Link href={connexionHref}> Consulter l&apos;aide</Link>
          </p>
        </li>
      </ul>
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
      <Button className="lpv-login__submit" disabled={isPending} type="submit">
        {isPending ? 'Connexion…' : 'Se connecter'}
      </Button>

      <div className="lpv-login__mention">Cette plateforme est privé et est destiné aux personnes habilité à la consulter. Tout contrevenant pourra faire l&#39;objet de poursuite.</div>
    </form>
  )
}
