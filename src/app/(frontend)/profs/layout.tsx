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

// Layout du portail profs : shell unique (entête + contenu + pied).
// L'entête est dans le shell : le CSS de masquage (body:has > header) ne l'affecte pas.
export default async function ProfsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <ContenuPage
      entete={
        <EnteteService
          deconnexion={Boolean(user)}
          libelleService="Espace profs"
          nomUtilisateur={user?.name ?? null}
          liens={[
            { href: '/profs', libelle: 'Tableau de bord' },
            { href: '/profs/disponibilites', libelle: 'Mes disponibilités' },
          ]}
        />
      }
      liensPied={[{ href: '/profs/login', libelle: 'Connexion' }]}
    >
      {children}
    </ContenuPage>
  )
}