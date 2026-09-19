import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'

import '../lpvboard.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace profs — LPV Board',
}

// Layout du portail profs : entête de service + thème clair forcé.
// La protection par rôle se fait page par page (requireProf / requireParent).
export default function ProfsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <EnteteService
        deconnexion
        libelleService="Espace profs"
        liens={[
          { href: '/profs', libelle: 'Tableau de bord' },
          { href: '/profs/disponibilites', libelle: 'Mes disponibilités' },
        ]}
      />
      <ContenuPage>{children}</ContenuPage>
    </>
  )
}