'use client'

import { useEffect, useRef } from 'react'

// Molécule : modale accessible (dialog).
// Escape ferme, clic à l'extérieur ferme, focus piégé sur le bouton principal.
// L'appelant passe le contenu (texte, actions) en children.
export function Modal({
  title,
  onClose,
  children,
  labelledBy,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  labelledBy?: string
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const primaryButtonRef = useRef<HTMLButtonElement>(null)

  const modalId = labelledBy ?? `modal-${title.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    primaryButtonRef.current?.focus()
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('keydown', escape)
    }
  }, [onClose])

  return (
    <div
      className="lpv-m-modal-overlay"
      onClick={(e) => {
        if (!modalRef.current?.contains(e.target as Node)) onClose()
      }}
    >
      <div
        aria-labelledby={modalId}
        aria-modal="true"
        className="lpv-m-modal"
        ref={modalRef}
        role="dialog"
      >
        <h2 className="lpv-m-modal__title" id={modalId}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}