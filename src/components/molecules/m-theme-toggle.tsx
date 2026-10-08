'use client'

import { useTheme } from '@/providers/Theme'

import type { ThemeMode } from '@/providers/Theme/types'
import { SegmentedToggle, type SegmentedOption } from '@/components/molecules/m-segmented-toggle'

// Molécule : bascule de thème via le SegmentedToggle (un tap par thème) :
// - auto : suivre la machine (rivet-icons:device-solid), aucune préférence
//   stockée — la machine qui bascule met l'app à jour en temps réel ;
// - light (boxicons:sun-bright-filled) et dark (boxicons:moon-star-filled) :
//   thème forcé, mémorisé (localStorage).
// Variante 'bar' (défaut) : icônes seules, blanc sur fond portail.
// Variante 'panel' : libellé de l'état courant + toggle (couleurs du panneau).
const STATE_BY_MODE: Record<ThemeMode, { icon: string; label: string }> = {
  auto: {
    icon: 'rivet-icons:device-solid',
    label: 'Thème : machine',
  },
  dark: {
    icon: 'boxicons:moon-star-filled',
    label: 'Mode sombre',
  },
  light: {
    icon: 'boxicons:sun-bright-filled',
    label: 'Mode clair',
  },
}

const MODES: ThemeMode[] = ['auto', 'light', 'dark']

// Variante compacte (sidebar) : un seul bouton qui fait défiler les modes
// machine → clair → sombre. Renvoie l'icône et le libellé du mode courant.
export function useThemeCycle() {
  const { setTheme, themeMode } = useTheme()
  const mode: ThemeMode = themeMode ?? 'auto'
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]

  return {
    ...STATE_BY_MODE[mode],
    cycle: () => setTheme(nextMode === 'auto' ? null : (nextMode as 'dark' | 'light')),
  }
}

export function ThemeToggle({ variant = 'bar' }: { variant?: 'bar' | 'panel' }) {
  const { setTheme, themeMode } = useTheme()
  // Premier rendu neutre (SSR) : le mode réel arrive avec l'hydratation du provider.
  const mode: ThemeMode = themeMode ?? 'auto'

  const options: SegmentedOption[] = MODES.map((value) => ({
    ariaLabel:
      value === 'auto'
        ? 'Thème : suivre la machine'
        : value === 'dark'
          ? 'Mode sombre'
          : 'Mode clair',
    icon: STATE_BY_MODE[value].icon,
    value,
  }))

  return (
    <div className={variant === 'panel' ? 'lpv-m-theme-toggle--panel' : 'lpv-m-theme-toggle'}>
      {variant === 'panel' && (
        <span>
          {mode === 'auto' ? 'Thème : machine' : mode === 'dark' ? 'Mode sombre' : 'Mode clair'}
        </span>
      )}
      <SegmentedToggle
        ariaLabel="Thème de l'interface"
        initialValue={mode}
        onChange={(value) => setTheme(value === 'auto' ? null : (value as 'dark' | 'light'))}
        options={options}
      />
    </div>
  )
}