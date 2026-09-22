import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/m-service-header'
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
    <ContenuPage
      entete={
        <EnteteService
          heroTexte="Le suivi de votre enfant : présences, retours et prêts."
          heroTitre="Espace parents"
          legales={[
            { href: '/rgpd', libelle: 'Mentions légales' },
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
          ]}
          services={[
            { description: 'Le suivi de votre enfant', href: '/parents', libelle: 'Espace parents' },
            { href: '/rgpd', libelle: 'Protection des données' },
          ]}
          utilisateur={user ? { email: user.email, nom: user.name } : null}
        />
      }
      liensPied={[{ href: '/parents/login', libelle: 'Connexion' }]}
      portail="parents"
    >
      {children}
    </ContenuPage>
  )
}