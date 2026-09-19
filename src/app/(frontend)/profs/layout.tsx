import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { ContenuPage, EnteteService } from '@/components/molecules/EnteteService'
import { HeroTitle } from '@/components/molecules/HeroTitle'
import { getMeUserServer } from '@/utilities/profAuth'

import '../lpvboard.css'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = { width: 'device-width', initialScale: 1 }

export const metadata: Metadata = {
  title: 'Espace profs — LPV Board',
}

// Layout du portail profs : entête + hero bleu façon GOV.UK + contenu + pied.
// Le h1 vit dans le hero ; les pages filles commencent directement par leur contenu.
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
      hero={
        <HeroTitle
          texte="Vos séances, présences et retours de séance, au même endroit."
          titre="Espace profs"
        />
      }
      liensPied={[{ href: '/profs/login', libelle: 'Connexion' }]}
    >
      {children}
    </ContenuPage>
  )
}