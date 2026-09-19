import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'
import { getMeUserServer } from '@/utilities/parentAuth'

import '../lpvboard.css'

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
          deconnexion={Boolean(user)}
          heroTexte="Le suivi de votre enfant : présences, retours et prêts."
          heroTitre="Espace parents"
          legales={[
            { href: '/rgpd', libelle: 'Mentions légales' },
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
          ]}
          nomUtilisateur={user?.name ?? null}
          services={[
            { description: 'Le suivi de votre enfant', href: '/parents', libelle: 'Espace parents' },
            { href: '/rgpd', libelle: 'Protection des données' },
          ]}
        />
      }
      liensPied={[{ href: '/parents/login', libelle: 'Connexion' }]}
    >
      {children}
    </ContenuPage>
  )
}