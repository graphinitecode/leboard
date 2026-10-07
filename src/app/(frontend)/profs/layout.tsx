import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/templates'
import { AppFooter } from '@/Footer/Component'
import { getMeUserServer } from '@/utilities/profAuth'
import { getShellNav } from '@/utilities/portalNav'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'LPV Board — Professeurs',
}

// Layout du portail profs : shell d'appli (sidebar, barre d'onglets mobile).
// Sections et compte viennent de la config de navigation selon le rôle.
export default async function ProfsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <AppShell footer={<AppFooter />} portail="profs" {...getShellNav('profs', user)}>
      {children}
    </AppShell>
  )
}
