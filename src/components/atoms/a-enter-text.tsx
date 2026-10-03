import type { MouseEventHandler, ReactNode } from 'react'

import { Icon } from '@/components/atoms/a-icon'
import Link from 'next/link'

export function EnterText({
  hrf,
  children,
  hiddenLabel = 'Avertissement',
  onClick,
}: {
  hrf: string,
  children: ReactNode,
  hiddenLabel?: string,
  onClick?: MouseEventHandler<HTMLAnchorElement>,
}) {
  return (
    <Link href={hrf} className="lpv-a-enter-text group" onClick={onClick}>
      <div className="lpv-a-enter-text__icon">
        <Icon className="lpv-a-enter-text__icon-svg" icon="rivet-icons:arrow-right" size={19} />
      </div>
      <p className="lpv-a-enter-text__text">
        <span className="lpv-visually-hidden">{hiddenLabel} : </span>
        {children}
      </p>
    </Link>
  )
}
