'use client'

import { useEffect, useState } from 'react'

import { Icon } from '@/components/atoms/a-icon'

// Molécule : bascule de thème (clair/sombre).
// Utilise le ThemeProvider du template Payload (localStorage + prefers-color-scheme).
// Icône lune en dark, soleil en light (boxicons filled).
// variante 'bar' (défaut) : icône seule, blanc sur fond portail.
// variante 'panel' : ligne libellé + icône, couleurs du panneau (surface).
export function ThemeToggle({ variant = 'bar' }: { variant?: 'bar' | 'panel' }) {
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

  function toggle() {
    const nouveau = theme === 'dark' ? 'light' : 'dark'
    setTheme(nouveau)
    window.localStorage.setItem('payload-theme', nouveau)
    document.documentElement.setAttribute('data-theme', nouveau)
  }

  const icon = theme === 'dark' ? 'boxicons:moon-star-filled' : 'boxicons:sun-bright-filled'
  const label = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'

  if (variant === 'panel') {
    return (
      <button aria-label={label} className="lpv-m-theme-toggle--panel" onClick={toggle} type="button">
        <span>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
        <Icon aria-hidden icon={icon} size={20} />
      </button>
    )
  }

  return (
    <button aria-label={label} className="lpv-m-theme-toggle" onClick={toggle} type="button">
      <Icon className="lpv-m-theme-toggle__icon" icon={icon} size={20} />
    </button>
  )
}
