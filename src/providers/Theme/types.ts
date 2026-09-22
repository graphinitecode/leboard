export type Theme = 'dark' | 'light'

// Mode de préférence : 'auto' (suivre la machine, aucune préférence stockée)
// ou le thème choisi explicitement par l'utilisateur.
export type ThemeMode = 'auto' | Theme

export interface ThemeContextType {
  setTheme: (theme: Theme | null) => void
  theme?: Theme | null
  themeMode?: ThemeMode
}

export function themeIsValid(string: null | string): string is Theme {
  return string ? ['dark', 'light'].includes(string) : false
}
