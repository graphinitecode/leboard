import { getCachedGlobal } from '@/utilities/getGlobals'
import { toAppFooterData, type AppFooterData } from '@/utilities/appFooter'

import { Footer as FooterView } from '@/components/organisms/o-footer'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return <FooterView data={footerData} />
}

// Données du pied de page minimaliste des portails (shell d'appli), même global
export async function getAppFooterData(): Promise<AppFooterData> {
  return toAppFooterData(await getCachedGlobal('footer', 1)())
}
