import { getCachedGlobal } from '@/utilities/getGlobals'

import { AppFooter as AppFooterView } from '@/components/molecules/m-app-footer'
import { Footer as FooterView } from '@/components/organisms/o-footer'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return <FooterView data={footerData} />
}

// Pied de page minimaliste des portails (shell d'appli), même global Payload
export async function AppFooter() {
  const footerData = await getCachedGlobal('footer', 1)()

  return <AppFooterView data={footerData} />
}
