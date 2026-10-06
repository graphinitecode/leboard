import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ServiceHeader } from '@/components/molecules/m-service-header'
import { PortalPage } from '@/components/templates'
import { getMeUserServer } from '@/utilities/parentAuth'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace parents — LPV Board',
}

// Layout du portail parents : entête bleue fusionnée avec le hero (visuels LPV).
export default async function ParentsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <PortalPage
      header={
        <ServiceHeader
          heroText="Le suivi de votre enfant : présences, retours et prêts."
          heroTitle="Espace parents"
          homeHref="/parents"
          user={
            user
              ? {
                  email: user.email,
                  logoutRedirect: '/parents/login',
                  nom: `${user.prenom} ${user.nom}`,
                  profileHref: '/parents/mon-profil',
                }
              : null
          }
        />
      }
      portail="parents"
    >
      {children}
    </PortalPage>
  )
}