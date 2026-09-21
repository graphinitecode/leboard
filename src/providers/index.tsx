import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { QueryProviders } from './QueryProviders'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <QueryProviders>{children}</QueryProviders>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
