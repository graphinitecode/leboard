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

// Layout du portail parents : entête de service avec le nom de l'utilisateur connecté.
export default async function ParentsLayout({ children }: { children: ReactNode }) {
  const user = await getMeUserServer()

  return (
    <>
      <EnteteService
        deconnexion={Boolean(user)}
        libelleService="Espace parents"
        nomUtilisateur={user?.name ?? null}
        liens={[{ href: '/rgpd', libelle: 'Protection des données' }]}
      />
      <ContenuPage>{children}</ContenuPage>
    </>
  )
}