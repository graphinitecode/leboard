import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ServiceHeader } from '@/components/molecules/m-service-header'
import { PortalPage } from '@/components/templates'
import { getMeUserServer } from '@/utilities/profAuth'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'LPV Board — Professeurs',
}

// Layout du portail profs : entête bleue fusionnée avec le hero (visuels LPV).
export default async function ProfsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <PortalPage
      header={
        <ServiceHeader
          heroText="Vos séances, présences et retours de séance, au même endroit."
          legalLinks={[
            { href: '/rgpd', label: 'Mentions légales' },
            { href: '/rgpd', label: 'Politique de confidentialité' },
          ]}
          services={[
            { description: 'Vos séances, présences et retours', href: '/profs', label: 'Mes séances' },
            { description: 'Vues semaine, jour et liste', href: '/profs/calendrier', label: 'Calendrier' },
            { description: 'Vos disponibilités hebdomadaires', href: '/profs/disponibilites', label: 'Mes disponibilités' },
            { description: 'Vos informations personnelles', href: '/profs/mon-profil', label: 'Mon profil' },
            { href: '/parents', label: 'Espace parents' },
          ]}
          user={user ? { nom: `${user.prenom} ${user.nom}`, email: user.email } : null}
        />
      }
      footerLinks={[{ href: '/profs/login', label: 'Connexion' }]}
    >
      {children}
    </PortalPage>
  )
}