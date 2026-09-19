'use client'

// Bouton de déconnexion des portails : POST /api/users/logout puis redirect.
export function BoutonDeconnexion() {
  return (
    <button
      className="lpv-bouton lpv-bouton--secondaire"
      onClick={async () => {
        await fetch('/api/users/logout', { method: 'POST' })
        window.location.href = '/'
      }}
      type="button"
    >
      Se déconnecter
    </button>
  )
}