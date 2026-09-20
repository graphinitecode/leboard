'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav aria-label="Navigation principale" className="lpv-entete-nav">
      {navItems.map(({ link }, i) => {
        return <CMSLink className="lpv-entete-nav__lien" key={i} {...link} appearance="inline" />
      })}
    </nav>
  )
}