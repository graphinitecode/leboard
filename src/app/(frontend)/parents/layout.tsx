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
          legalLinks={[
            { href: '/rgpd', label: 'Mentions légales' },
            { href: '/rgpd', label: 'Politique de confidentialité' },
          ]}
          services={[
            { description: 'Le suivi de votre enfant', href: '/parents', label: 'Espace parents' },
            { href: '/rgpd', label: 'Protection des données' },
          ]}
          user={user ? { nom: `${user.prenom} ${user.nom}`, email: user.email } : null}
        />
      }
      footerLinks={[{ href: '/parents/login', label: 'Connexion' }]}
      portail="parents"
    >
      {children}
    </PortalPage>
  )
}