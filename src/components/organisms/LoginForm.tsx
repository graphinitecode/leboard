'use client'

import Link from 'next/link'

import { useState } from 'react'

import { Bouton } from '@/components/atoms/Bouton'
import { ChampFormulaire, ResumeErreurs } from '@/components/molecules'

export function LoginForm({
  cible,
  sousTitre,
  titre = 'Connexion',
}: {
  cible: string
  sousTitre?: string
  titre?: string
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErreur(null)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setErreur('Email ou mot de passe incorrect.')
        return
      }

      window.location.href = cible
    } catch {
      setErreur('Désolé, il y a un problème technique. Réessayez dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="lpv-login" onSubmit={submit}>
      <h1 className="lpv-login__titre">{titre}</h1>
      {sousTitre ? <p className="lpv-login__sous-titre">{sousTitre}</p> : null}
      <ResumeErreurs erreurs={erreur ? [{ champId: 'email', texte: erreur }] : []} />
      <ChampFormulaire
        autoComplete="email"
        id="email"
        label="Adresse e-mail"
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        value={email}
      />
      <ChampFormulaire
        autoComplete="current-password"
        id="motdepasse"
        label="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />
      <p className="lpv-login__oublie">
        Mot de passe oublié ? <Link href="/admin/forgot-password">Réinitialiser ici</Link>
      </p>
      <Bouton disabled={loading} type="submit">
        {loading ? 'Connexion…' : 'Se connecter'}
      </Bouton>
    </form>
  )
}