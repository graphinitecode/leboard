import type { CSSProperties } from 'react'

import rivetIcons from '@iconify-json/rivet-icons/icons.json'
import boxicons from '@iconify-json/boxicons'

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
// Usage : <Icon icone="rivet-icons:chevron-down" taille={16} />
// L'icône est décorative par défaut (aria-hidden) — passer un libelle
// pour une icône informative.
export function Icon({
  icone,
  taille = 16,
  libelle,
  classe,
  style,
}: {
  icone: string
  taille?: number
  libelle?: string
  classe?: string
  style?: CSSProperties
}) {
  const [prefix, nom] = icone.split(':') as [Collection, string]
  const collection = COLLECTIONS[prefix]

  if (!collection) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon: collection inconnue « ${prefix} »`)
    }
    return null
  }

  const donnees = collection.icons[nom]

  if (!donnees) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Icon: icône inconnue « ${icone} »`)
    }
    return null
  }

  // Iconify : largeur par défaut = hauteur (set carré 24)
  const largeur = donnees.width ?? collection.width ?? collection.height ?? 24

  return (
    <svg
      aria-hidden={libelle ? undefined : true}
      aria-label={libelle}
      className={classe}
      dangerouslySetInnerHTML={{ __html: donnees.body }}
      fill="currentColor"
      height={taille}
      role={libelle ? 'img' : undefined}
      style={style}
      viewBox={`0 0 ${largeur} 24`}
      width={taille}
      xmlns="http://www.w3.org/2000/svg"
    />
  )
}