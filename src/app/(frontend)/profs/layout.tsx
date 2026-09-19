import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'
import { getMeUserServer } from '@/utilities/profAuth'

import '../lpvboard.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace profs — LPV Board',
}

// Layout du portail profs : entête bleue fusionnée avec le hero (visuels LPV).
export default async function ProfsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <ContenuPage
      entete={
        <EnteteService
          deconnexion={Boolean(user)}
          heroTexte="Vos séances, présences et retours de séance, au même endroit."
          heroTitre="Espace profs"
          legales={[
            { href: '/rgpd', libelle: 'Mentions légales' },
            { href: '/rgpd', libelle: 'Politique de confidentialité' },
          ]}
          nomUtilisateur={user?.name ?? null}
          services={[
            { description: 'Vos séances, présences et retours', href: '/profs', libelle: 'Espace professeurs' },
            { description: 'Vos disponibilités hebdomadaires', href: '/profs/disponibilites', libelle: 'Mes disponibilités' },
            { href: '/parents', libelle: 'Espace parents' },
          ]}
        />
      }
      liensPied={[{ href: '/profs/login', libelle: 'Connexion' }]}
    >
      {children}
    </ContenuPage>
  )
}