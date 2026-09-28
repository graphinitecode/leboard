import { IconCard, type IconCardColor } from '@/components/atoms/a-icon-card'
import Link from 'next/link'

export function ActionIconcard({ icon = 'rivet-icons:gear-solid', color = 'orange', title, description }: { icon?: string, color?: IconCardColor, title: string, description?: string }) {
  return (
    <div className="action-card">
      {/*<IconCard icon={''} />*/}
      <IconCard icon={icon} color={color} size="lg" />
      <div className="action-card__content">
        <Link
          href={''}
          className="title"
        >
          {title}
        </Link>
        <p className="description">
          {description}
        </p>
      </div>
    </div>
  )
}
