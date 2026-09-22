import type { CSSProperties } from 'react'

import rivetIcons from '@iconify-json/rivet-icons/icons.json'
import boxicons from '@iconify-json/boxicons/icons.json'

type Collection = 'rivet-icons' | 'boxicons'

type IconSet = {
  icons: Record<string, { body: string; width?: number }>
  width?: number
  height?: number
}

const COLLECTIONS: Record<Collection, IconSet> = {
  'boxicons': boxicons as unknown as IconSet,
  'rivet-icons': rivetIcons as unknown as IconSet,
}

// Atome : icône SVG rendue côté serveur depuis les JSON Iconify.
// Usage : <Icon icon="rivet-icons:chevron-down" size={16} />
// L'icône est décorative par défaut (aria-hidden) — pass a label
// pour une icône informative.
export function Icon({
  icon,
  size = 16,
  label,
  className,
  style,
}: {
  icon: string
  size?: number
  label?: string
  className?: string
  style?: CSSProperties
}) {
  const [prefix, name] = icon.split(':') as [Collection, string]
  const collection = COLLECTIONS[prefix]

  if (!collection) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon: collection inconnue « ${prefix} »`)
    }
    return null
  }

  const data = collection.icons[name]

  if (!data) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon: unknown icon « ${icon} »`)
    }
    return null
  }

  // Iconify : hauteur par défaut d'un set = 16 (convention Iconify quand
  // height est absent). Largeur = largeur de l'icône si définie, sinon
  // largeur du set, sinon carrée (= hauteur). rivet-icons est 16x16,
  // boxicons 24x24.
  const iconHeight = collection.height ?? 16
  const setWidth = collection.width ?? iconHeight
  const width = data.width ?? setWidth

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={className}
      dangerouslySetInnerHTML={{ __html: data.body }}
      fill="currentColor"
      height={size}
      role={label ? 'img' : undefined}
      style={style}
      viewBox={`0 0 ${width} ${iconHeight}`}
      width={(size * width) / iconHeight}
      xmlns="http://www.w3.org/2000/svg"
    />
  )
}