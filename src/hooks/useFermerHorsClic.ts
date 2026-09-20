'use client'

import { useEffect } from 'react'

// Hook : ferme un panneau déroulant au clic extérieur ou à la touche Escape.
// Extrait du MenuDepliant pour être partagé avec les dropdowns de la nav.
// Args : ref sur le conteneur (bouton + panneau) et callback de fermeture.
export function useFermerHorsClic(
  ref: React.RefObject<HTMLElement | null>,
  fermer: () => void,
) {
  useEffect(() => {
    function horsClic(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) fermer()
    }
    function escape(e: KeyboardEvent) {
      if (e.key === 'Escape') fermer()
    }
    document.addEventListener('mousedown', horsClic)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', horsClic)
      document.removeEventListener('keydown', escape)
    }
  }, [ref, fermer])
}