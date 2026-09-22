'use client'

import { useEffect } from 'react'

// Hook : ferme un panneau déroulant au clic extérieur ou à la touche Escape.
// Extrait du CollapsibleMenu pour être partagé avec les dropdowns de la nav.
// Args : ref sur le conteneur (bouton + panneau) et callback de fermeture.
export function useCloseOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    function horsClic(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', horsClic)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', horsClic)
      document.removeEventListener('keydown', escape)
    }
  }, [ref, onClose])
}