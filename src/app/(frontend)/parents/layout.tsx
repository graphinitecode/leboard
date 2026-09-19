import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'

import '../lpvboard.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace parents — LPV Board',
}

// Layout du portail parents : entête + thème clair forcé.
export default function ParentsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EnteteService
        libelleService="Espace parents"
        liens={[{ href: '/rgpd', libelle: 'Protection des données' }]}
      />
      <ContenuPage>{children}</ContenuPage>
    </>
  )
}