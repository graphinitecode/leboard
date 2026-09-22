'use client'

import { useEffect, useRef, useState } from 'react'

// Molécule : toast pleine largeur en haut de l'écran, auto-dismiss après 5s.
// role="status" pour l'accessibilité (annonce par lecteurs d'écran).
// Inspiré du pattern GOV.UK : bref, visible, sans interaction requise.
export function Toast({
  message,
  type = 'success',
  duration = 5000,
  onClose,
}: {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onClose?: () => void
}) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, duration)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration, onClose])

  if (!visible) return null

  return (
    <div
      className={`lpv-toast${type === 'error' ? ' lpv-m-toast--error' : ''}`}
      role="status"
    >
      {message}
    </div>
  )
}
