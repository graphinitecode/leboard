'use client'

import React, { createContext, useCallback, useEffect, use, useState } from 'react'

import type { Theme, ThemeContextType, ThemeMode } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { getImplicitPreference, themeLocalStorageKey } from './shared'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
  themeMode: 'auto',
}

const ThemeContext = createContext(initialContext)

// Mode courant : une préférence stockée = thème choisi, sinon « suivre la machine ».
function getStoredMode(): ThemeMode {
  const stored = window.localStorage.getItem(themeLocalStorageKey)
  return stored === 'dark' || stored === 'light' ? stored : 'auto'
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Le script InitTheme (beforeInteractive) a déjà posé data-theme sur <html>
  // avant l'hydratation : inutile de le refaire dans un effet (setState en effet
  // déclenche un rendu en cascade, règle react-hooks/set-state-in-effect).
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto')

  // Lecture du mode après hydratation : localStorage n'existe pas côté serveur.
  // Disable justifié : lecture d'un système externe, cas d'usage légitime.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeModeState(getStoredMode())
  }, [])

  // En mode auto, la machine qui bascule (jour/nuit) met l'app à jour en temps
  // réel : data-theme + état React suivent prefers-color-scheme. Les changements
  // du listener ne s'appliquent que si aucune préférence n'est stockée.
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    function onMachineThemeChange(event: MediaQueryListEvent) {
      if (window.localStorage.getItem(themeLocalStorageKey) !== null) return
      const appliedTheme: Theme = event.matches ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', appliedTheme)
      setThemeState(appliedTheme)
    }
    mql.addEventListener('change', onMachineThemeChange)
    return () => {
      mql.removeEventListener('change', onMachineThemeChange)
    }
  }, [])

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      // Retour au mode auto : préférence supprimée, la machine reprend le contrôle.
      window.localStorage.removeItem(themeLocalStorageKey)
      setThemeModeState('auto')
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
      if (implicitPreference) setThemeState(implicitPreference)
    } else {
      setThemeModeState(themeToSet)
      setThemeState(themeToSet)
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
  }, [])

  return <ThemeContext value={{ setTheme, theme, themeMode }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)