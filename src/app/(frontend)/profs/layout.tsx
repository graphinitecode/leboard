import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ServiceHeader } from '@/components/molecules/m-service-header'
import { PortalPage } from '@/components/templates'
import { getMeUserServer } from '@/utilities/profAuth'
import { Footer } from '@/Footer/Component'

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
      footer={<Footer />}
      header={
        <ServiceHeader
          heroText="Vos séances, présences et retours de séance, au même endroit."
          homeHref="/profs"
          navLinks={[
            { href: '/profs', label: 'Tableau de bord', match: ['/profs/seances'] },
            { href: '/profs/calendrier', label: 'Calendrier' },
            { href: '/profs/eleves', label: 'Élèves' },
            { href: '/profs/bibliotheque', label: 'Bibliothèque' },
            { href: '/profs/disponibilites', label: 'Disponibilités' },
          ]}
          user={
            user
              ? {
                  email: user.email,
                  logoutRedirect: '/profs/login',
                  nom: `${user.prenom} ${user.nom}`,
                  profileHref: '/profs/mon-profil',
                }
              : null
          }
        />
      }
    >
      {children}
    </PortalPage>
  )
}