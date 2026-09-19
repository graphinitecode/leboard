'use client'

import { useState, useTransition } from 'react'

import { Bouton } from '@/components/atoms/Bouton'
import { ChampFormulaire, ResumeErreurs } from '@/components/molecules'

export function LoginForm({
  cible,
  libelleService,
  note,
}: {
  cible: string
  libelleService: string
  note?: string
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
    <form onSubmit={submit} style={{ maxWidth: 420 }}>
      <h1 className="lpv-h1">{libelleService}</h1>
      {note ? <p className="lpv-muted">{note}</p> : null}
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <ChampFormulaire
        autoComplete="email"
        erreur={erreur ?? undefined}
        id="email"
        label="Adresse email"
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        value={email}
      />
      <ChampFormulaire
        autoComplete="current-password"
        erreur={erreur ?? undefined}
        id="motdepasse"
        label="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        value={password}
      />
      <Bouton disabled={loading} type="submit">
        {loading ? 'Connexion…' : 'Se connecter'}
      </Bouton>
      <p style={{ marginTop: '1rem' }}>
        <a href="/admin/forgot-password">Mot de passe oublié</a>
      </p>
    </form>
  )
}