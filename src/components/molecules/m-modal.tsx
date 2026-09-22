'use client'

import { useEffect, useRef } from 'react'

// Molécule : modale accessible (dialog).
// Escape ferme, clic à l'extérieur ferme, focus piégé sur le bouton principal.
// L'appelant passe le contenu (texte, actions) en children.
export function Modale({
  titre,
  onFerme,
  children,
  labelledBy,
}: {
  titre: string
  onFerme: () => void
  children: React.ReactNode
  labelledBy?: string
}) {
  const modaleRef = useRef<HTMLDivElement>(null)
  const boutonRef = useRef<HTMLButtonElement>(null)

  const modaleId = labelledBy ?? `modale-${titre.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    boutonRef.current?.focus()
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') onFerme()
    }
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('keydown', escape)
    }
  }, [onFerme])

  return (
    <div
      className="lpv-modale-fond"
      onClick={(e) => {
        if (!modaleRef.current?.contains(e.target as Node)) onFerme()
      }}
    >
      <div
        aria-labelledby={modaleId}
        aria-modal="true"
        className="lpv-modale"
        ref={modaleRef}
        role="dialog"
      >
        <h2 className="lpv-modale__titre" id={modaleId}>
          {titre}
        </h2>
        {children}
      </div>
    </div>
  )
}