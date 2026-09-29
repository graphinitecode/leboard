import { IconCard, type IconCardColor } from '@/components/atoms/a-icon-card'
import Link from 'next/link'
import type { UrlObject } from 'url'
type Url = string | UrlObject

export function ActionIconcard({
  icon = 'rivet-icons:gear-solid',
  color = 'orange',
  href,
  title,
  description,
}: {
  icon?: string
  color?: IconCardColor
  href?: Url
  title: string
  description?: string
}) {
  return (
    <div className="action-card">
      <IconCard icon={icon} color={color} size="lg" />
      <div className="action-card__content">
        {href &&
          <Link href={href} className="title">
            {title}
          </Link>
        }
        <p className="description">{description}</p>
      </div>
    </div>
  )
}
