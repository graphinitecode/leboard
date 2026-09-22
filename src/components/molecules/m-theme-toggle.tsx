'use client'

import { useTheme } from '@/providers/Theme'

import { Icon } from '@/components/atoms/a-icon'

import type { ThemeMode } from '@/providers/Theme/types'

// Molécule : bascule de thème, cycle 3 états via le ThemeProvider :
// - auto : suivre la machine (rivet-icons:device-solid), aucune préférence
//   stockée — la machine qui bascule met l'app à jour en temps réel ;
// - light (boxicons:sun-bright-filled) et dark (boxicons:moon-star-filled) :
//   thème forcé, mémorisé (localStorage).
// variante 'bar' (défaut) : icône seule, blanc sur fond portail.
// variante 'panel' : ligne libellé + icône, couleurs du panneau (surface).
const STATE_BY_MODE: Record<ThemeMode, { icon: string; label: string; next: 'auto' | 'dark' | 'light'; nextLabel: string }> = {
  auto: {
    icon: 'rivet-icons:device-solid',
    label: 'Thème : suivre la machine',
    next: 'light',
    nextLabel: 'forcer le mode clair',
  },
  dark: {
    icon: 'boxicons:moon-star-filled',
    label: 'Thème : sombre',
    next: 'auto',
    nextLabel: 'suivre la machine',
  },
  light: {
    icon: 'boxicons:sun-bright-filled',
    label: 'Thème : clair',
    next: 'dark',
    nextLabel: 'forcer le mode sombre',
  },
}

export function ThemeToggle({ variant = 'bar' }: { variant?: 'bar' | 'panel' }) {
  const { setTheme, themeMode } = useTheme()
  // Premier rendu neutre (SSR) : le mode réel arrive avec l'hydratation du provider.
  const mode: ThemeMode = themeMode ?? 'auto'
  const state = STATE_BY_MODE[mode]

  return (
    <button
      aria-label={`${state.label}, cliquer pour ${state.nextLabel}`}
      className={variant === 'panel' ? 'lpv-m-theme-toggle--panel' : 'lpv-m-theme-toggle'}
      onClick={() => setTheme(state.next === 'auto' ? null : state.next)}
      type="button"
    >
      {variant === 'panel' && (
        <span>{mode === 'auto' ? 'Thème : machine' : mode === 'dark' ? 'Mode sombre' : 'Mode clair'}</span>
      )}
      <Icon aria-hidden className={variant === 'panel' ? undefined : 'lpv-m-theme-toggle__icon'} icon={state.icon} size={20} />
    </button>
  )
}