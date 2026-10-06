import type { ReactNode } from 'react'

import { Footer } from '@/components/molecules/m-footer'

// Template : shell complet d'une page de portail.
// portail: 'profs' (bleu, défaut) | 'parents' (violet) | 'eleves' (orange) —
// pilote la couleur via data-lpv-portail. Masque le chrome du site vitrine.
// header : slot recevant la molécule ServiceHeader.
export function PortalPage({
  children,
  header,
  footerLinks,
  portail = 'profs',
}: {
  children: ReactNode
  header?: ReactNode
  footerLinks?: { href: string; label: string }[]
  portail?: 'profs' | 'parents' | 'eleves'
}) {
  return (
    <div
      className="lpv-t-portal-page lpv-shell"
      data-lpv-portail={portail}
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <a className="lpv-skip-link" href="#contenu-principal">
        Aller au contenu principal
      </a>
      {header}
      <main className="lpv-container" id="contenu-principal" style={{ flex: 1, width: '100%' }}>
        {children}
      </main>
      <Footer links={footerLinks} />
    </div>
  )
}
