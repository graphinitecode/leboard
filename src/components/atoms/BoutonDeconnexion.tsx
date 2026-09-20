'use client'

import { useRouter } from 'next/navigation'

// Bouton de déconnexion des portails : POST /api/users/logout puis redirect.
export function BoutonDeconnexion() {
  const router = useRouter()

  return (
    <button
      className="lpv-bouton lpv-bouton--secondaire"
      onClick={async () => {
        await fetch('/api/users/logout', { method: 'POST' })
        router.push('/')
      }}
      type="button"
    >
      Se déconnecter
    </button>
  )
}