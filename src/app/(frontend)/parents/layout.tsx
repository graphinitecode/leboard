import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { AppShell } from '@/components/templates'
import { AppFooter } from '@/Footer/Component'
import { getMeUserServer } from '@/utilities/parentAuth'
import { getShellNav } from '@/utilities/portalNav'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace parents — LPV Board',
}

// Layout du portail parents : shell d'appli en violet (sidebar, barre
// d'onglets mobile).
export default async function ParentsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <AppShell footer={<AppFooter />} portail="parents" {...getShellNav('parents', user)}>
      {children}
    </AppShell>
  )
}
