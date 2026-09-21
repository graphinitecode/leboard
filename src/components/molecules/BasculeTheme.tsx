'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/atoms/Icon'

// Molécule : bascule de thème (clair/sombre).
// Utilise le ThemeProvider du template Payload (localStorage + prefers-color-scheme).
// Icône lune en dark, soleil en light (boxicons filled).
export function BasculeTheme() {
  const [theme, setTheme] = useState<'dark' | 'light' | null>(null)

  // La préférence ne peut être lue qu'après hydratation (window n'existe pas
  // côté serveur) : le premier rendu est volontairement neutre (SSR), l'effet
  // synchronise ensuite l'icône avec le thème réel. Disable justifié : c'est
  // le cas d'usage légitime « subscribe to external system » de useEffect,
  // la règle react-hooks/set-state-in-effect du compilateur n'admet pas
  // d'exception aussi ciblée.
  useEffect(() => {
    const stored = window.localStorage.getItem('payload-theme')
    if (stored === 'dark' || stored === 'light') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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