import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/m-service-header'
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
    <ContenuPage
      entete={
        <EnteteService
          heroTexte="Vos séances, présences et retours de séance, au même endroit."
          legales={[
            { href: '/rgpd', libelle: 'Mentions légales' },
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
          ]}
          services={[
            { description: 'Vos séances, présences et retours', href: '/profs', libelle: 'Mes séances' },
            { description: 'Vos disponibilités hebdomadaires', href: '/profs/disponibilites', libelle: 'Mes disponibilités' },
            { href: '/parents', libelle: 'Espace parents' },
          ]}
          utilisateur={user ? { email: user.email, nom: user.name } : null}
        />
      }
      liensPied={[{ href: '/profs/login', libelle: 'Connexion' }]}
    >
      {children}
    </ContenuPage>
  )
}