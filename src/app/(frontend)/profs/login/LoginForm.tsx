'use client'

import { useState } from 'react'

import { BoutonPrincipal, ChampTexte, ResumeErreurs } from '@/components/govuk/Formulaires'

export default function ProfLoginForm() {
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

      window.location.href = '/profs'
    } catch {
      setErreur('Désolé, il y a un problème technique. Réessayez dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360 }}>
      <h1>Espace profs</h1>
      <ResumeErreurs erreurs={erreur ? [erreur] : []} />
      <ChampTexte
        autoComplete="email"
        erreur={erreur ?? undefined}
        id="email"
        label="Adresse email"
        onChange={(e) => setEmail(e.target.value)}
        required
        type="email"
        value={email}
      />
      <ChampTexte
        autoComplete="current-password"
        erreur={erreur ?? undefined}
        id="motdepasse"
        label="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        required
        type="password"
        value={password}
      />
      <BoutonPrincipal disabled={loading} type="submit">
        {loading ? 'Connexion…' : 'Se connecter'}
      </BoutonPrincipal>
      <p style={{ marginTop: '1rem' }}>
        <a href="/admin/forgot-password">Mot de passe oublié</a>
      </p>
    </form>
  )
}