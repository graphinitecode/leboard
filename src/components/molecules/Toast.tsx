'use client'

import { useEffect, useRef, useState } from 'react'

// Molécule : toast pleine largeur en haut de l'écran, auto-dismiss après 5s.
// role="status" pour l'accessibilité (annonce par lecteurs d'écran).
// Inspiré du pattern GOV.UK : bref, visible, sans interaction requise.
export function Toast({
  message,
  type = 'succes',
  duree = 5000,
  onFerme,
}: {
  message: string
  type?: 'succes' | 'erreur'
  duree?: number
  onFerme?: () => void
}) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (duree > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        onFerme?.()
      }, duree)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duree, onFerme])

  if (!visible) return null

  return (
    <div
      className={`lpv-toast${type === 'erreur' ? ' lpv-toast--erreur' : ''}`}
      role="status"
    >
      {message}
    </div>
  )
}