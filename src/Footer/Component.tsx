import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="lpv-pied">
      <div className="lpv-pied__inner">
        <div>
          <Link className="lpv-pied__logo" href="/">
            <Logo />
          </Link>
        </div>

        <div className="lpv-pied__nav-zone">
          <ThemeSelector />
          <nav aria-label="Liens de pied de page" className="lpv-pied__nav">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="lpv-pied__lien" key={i} {...link} appearance="inline" />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
