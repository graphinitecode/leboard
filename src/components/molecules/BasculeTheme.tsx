'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/atoms/Icon'

// Molécule : bascule de thème (clair/sombre).
// Utilise le ThemeProvider du template Payload (localStorage + prefers-color-scheme).
// Icône lune en dark, soleil en light (boxicons filled).
export function BasculeTheme() {
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('payload-theme')
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored)
    } else {
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      setTheme(mql.matches ? 'dark' : 'light')
    }
  }, [])

  function basculer() {
    const nouveau = theme === 'dark' ? 'light' : 'dark'
    setTheme(nouveau)
    window.localStorage.setItem('payload-theme', nouveau)
    document.documentElement.setAttribute('data-theme', nouveau)
  }

  const icone = theme === 'dark' ? 'boxicons:moon-star-filled' : 'boxicons:sun-bright-filled'

  return (
    <button
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="lpv-bascule-theme"
      onClick={basculer}
      type="button"
    >
      <Icon classe="lpv-bascule-theme__icone" icone={icone} taille={20} />
    </button>
  )
}