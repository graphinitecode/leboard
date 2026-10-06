import { getCachedGlobal } from '@/utilities/getGlobals'

import { Footer as FooterView } from '@/components/organisms/o-footer'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  return <FooterView data={footerData} />
}
