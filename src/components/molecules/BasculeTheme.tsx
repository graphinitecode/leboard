'use client'

import { useEffect, useState } from 'react'

// Molécule : bascule de thème (clair/sombre).
// Utilise le ThemeProvider du template Payload (localStorage + prefers-color-scheme).
// Icône lune en dark, soleil en light.
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

  return (
    <button
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="lpv-bascule-theme"
      onClick={basculer}
      type="button"
    >
      {theme === 'dark' ? (
        <svg aria-hidden="true" className="lpv-bascule-theme__icone" fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3a9 9 0 1 0 9 9c0-3.73-2.28-6.93-5.5-8.24A7.5 7.5 0 0 1 12 3Z" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="lpv-bascule-theme__icone" fill="currentColor" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5ZM12 2a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1ZM12 19a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1ZM4.22 4.22a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41ZM19.78 4.22a1 1 0 0 1 0 1.41l-.71.71a1 1 0 0 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0ZM2 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1ZM20 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1ZM4.93 19.07a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41ZM17.66 17.66a1 1 0 0 1 1.41 0l.71.71a1 1 0 0 1-1.41 1.41l-.71-.71a1 1 0 0 1 0-1.41Z" />
        </svg>
      )}
    </button>
  )
}