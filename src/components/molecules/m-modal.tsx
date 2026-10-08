'use client'

import { useEffect, useRef } from 'react'

// Molécule : modale accessible (dialog).
// Escape ferme, clic à l'extérieur ferme, focus piégé sur le bouton principal.
// L'appelant passe le contenu (texte, actions) en children.
// variant 'sheet' : feuille ancrée en bas de l'écran (menu « Plus » mobile),
// le focus est placé sur la feuille elle-même à l'ouverture.
export function Modal({
  title,
  onClose,
  children,
  labelledBy,
  variant = 'dialog',
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  labelledBy?: string
  variant?: 'dialog' | 'sheet'
}) {
  const modalRef = useRef<HTMLDivElement>(null)
  const primaryButtonRef = useRef<HTMLButtonElement>(null)

  const modalId = labelledBy ?? `modal-${title.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    if (variant === 'sheet') modalRef.current?.focus()
    else primaryButtonRef.current?.focus()
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('keydown', escape)
    }
  }, [onClose, variant])

  return (
    <div
      className={`lpv-m-modal-overlay${variant === 'sheet' ? ' lpv-m-modal-overlay--sheet' : ''}`}
      onClick={(e) => {
        if (!modalRef.current?.contains(e.target as Node)) onClose()
      }}
    >
      <div
        aria-labelledby={modalId}
        aria-modal="true"
        className={`lpv-m-modal${variant === 'sheet' ? ' lpv-m-modal--sheet' : ''}`}
        ref={modalRef}
        role="dialog"
        tabIndex={variant === 'sheet' ? -1 : undefined}
      >
        <h2 className="lpv-m-modal__title" id={modalId}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}