'use client'

import { useRouter } from 'next/navigation'

// Bouton de déconnexion des portails : POST /api/users/logout puis redirect.
export function LogoutButton() {
  const router = useRouter()

  return (
    <button
      className="lpv-a-button lpv-a-button--secondary"
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
