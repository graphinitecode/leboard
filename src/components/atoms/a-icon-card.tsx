import { Icon } from '@/components/atoms/index'

export type IconCardColor = 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'violet' | 'magenta' | 'teal'
type Size = 'sm' | 'md' | 'lg' | 'xl'

const CLASSES: Record<Size, string> = {
  sm: 'lpv-a-iconcard lpv-a-iconcard--sm',
  md: 'lpv-a-iconcard',
  lg: 'lpv-a-iconcard lpv-a-iconcard--lg',
  xl: 'lpv-a-iconcard lpv-a-iconcard--xl',
}
const SIZE_ICON: Record<Size, number> = {
  sm: 16,
  md: 29,
  lg: 36,
  xl: 48,
}


export function IconCard({
  className,
  icon,
  color = 'blue',
  size = 'md',
}: {
  className?: string
  icon: string
  color?: IconCardColor
  size?: Size
}) {
  const classes = `${CLASSES[size]}${className ? ` ${className}` : ''}`
  const size_icon = SIZE_ICON[size]
  return (
    <div className={classes + ` lpv-a-iconcard--${color}`}>
      <Icon icon={icon} size={size_icon} />
    </div>
  )
}
