import type { Metadata } from 'next'

import { BackLink } from '@/components/atoms'

export const metadata: Metadata = {
  title: 'Couleurs — Design system LPV Board',
  robots: { index: false, follow: false },
}

interface SwatchData {
  name: string
  token: string
  hex: string
}

// Les hex documentent la valeur du thème clair ; le swatch utilise la variable
// CSS : il reflète le thème actif (la palette s'assombrit en mode sombre).
const FUNCTIONAL: SwatchData[] = [
  { name: 'portail (courant)', token: '--lpv-portail', hex: '#3d9eff' },
  { name: 'texte principal', token: '--lpv-text', hex: '#241623' },
  { name: 'texte secondaire', token: '--lpv-text-muted', hex: '#565656' },
  { name: 'surface', token: '--lpv-surface', hex: '#f8f8f8' },
  { name: 'fond de page', token: '--lpv-background', hex: '#ffffff' },
  { name: 'bordure', token: '--lpv-grey-border', hex: '#d8dadc' },
  { name: 'focus', token: '--lpv-focus', hex: '#fd0' },
  { name: 'succès', token: '--lpv-green', hex: '#00af54' },
  { name: 'avertissement', token: '--lpv-orange', hex: '#f96900' },
  { name: 'erreur', token: '--lpv-red', hex: '#ff5154' },
  { name: 'texte sur portail', token: '--lpv-on-portal', hex: '#ffffff' },
]

const GROUPS: { title: string; swatches: SwatchData[] }[] = [
  {
    title: 'Blue',
    swatches: [
      { name: 'principale', token: '--lpv-blue', hex: '#3d9eff' },
      { name: 'soft (tint)', token: '--lpv-blue-soft', hex: '#eaf5ff' },
      { name: 'dark (shade)', token: '--lpv-blue-dark', hex: '#1877d2' },
    ],
  },
  {
    title: 'Violet',
    swatches: [
      { name: 'principale', token: '--lpv-violet', hex: '#9000b3' },
      { name: 'soft (tint)', token: '--lpv-violet-soft', hex: '#f6e8fb' },
      { name: 'dark (shade)', token: '--lpv-violet-dark', hex: '#6b0087' },
    ],
  },
  {
    title: 'Green',
    swatches: [
      { name: 'principale', token: '--lpv-green', hex: '#00af54' },
      { name: 'soft (tint)', token: '--lpv-green-soft', hex: '#e2f7ec' },
    ],
  },
  {
    title: 'Orange',
    swatches: [
      { name: 'principale', token: '--lpv-orange', hex: '#f96900' },
      { name: 'soft (shade)', token: '--lpv-orange-soft', hex: '#d35701' },
      { name: 'hover', token: '--lpv-orange-hover', hex: '#d94e00' },
      { name: 'portail élèves', token: '--lpv-orange-portail', hex: '#e4572e' },
    ],
  },
  {
    title: 'Yellow',
    swatches: [
      { name: 'principale', token: '--lpv-yellow', hex: '#f4d35e' },
      { name: 'soft (tint)', token: '--lpv-yellow-soft', hex: '#fdf6e0' },
    ],
  },
  {
    title: 'Red',
    swatches: [
      { name: 'principale', token: '--lpv-red', hex: '#ff5154' },
      { name: 'soft (tint)', token: '--lpv-red-soft', hex: '#ffeaeb' },
      { name: 'hover', token: '--lpv-red-hover', hex: '#e04245' },
      { name: 'ombre', token: '--lpv-red-shadow', hex: '#cc3a3d' },
    ],
  },
]

const TAG_COLORS: SwatchData[] = [
  { name: 'green', token: '--lpv-a-tag--green', hex: '#00a14c' },
  { name: 'yellow', token: '--lpv-a-tag--yellow', hex: '#f4d35e' },
  { name: 'orange', token: '--lpv-a-tag--orange', hex: '#ff6b00' },
  { name: 'red', token: '--lpv-a-tag--red', hex: '#ff0004' },
  { name: 'blue', token: '--lpv-a-tag--blue', hex: '#0080ff' },
  { name: 'violet', token: '--lpv-a-tag--violet', hex: '#9000b3' },
  { name: 'magenta', token: '--lpv-a-tag--magenta', hex: '#c62991' },
  { name: 'teal', token: '--lpv-a-tag--teal', hex: '#007c8c' },
]

const TAG_SOFT: SwatchData[] = [
  { name: 'green bg / text', token: '--lpv-a-tag--green-bg', hex: '#e2f7ec' },
  { name: 'yellow bg / text', token: '--lpv-a-tag--yellow-bg', hex: '#fdf6e0' },
  { name: 'orange bg / text', token: '--lpv-a-tag--orange-bg', hex: '#feefe4' },
  { name: 'red bg / text', token: '--lpv-a-tag--red-bg', hex: '#ffeaeb' },
  { name: 'blue bg / text', token: '--lpv-a-tag--blue-bg', hex: '#eaf5ff' },
  { name: 'violet bg / text', token: '--lpv-a-tag--violet-bg', hex: '#f6e8fb' },
  { name: 'magenta bg / text', token: '--lpv-a-tag--magenta-bg', hex: '#fbe4f2' },
  { name: 'teal bg / text', token: '--lpv-a-tag--teal-bg', hex: '#e0f2f4' },
]

const NEUTRALS: SwatchData[] = [
  { name: 'texte', token: '--lpv-text', hex: '#241623' },
  { name: 'texte secondaire', token: '--lpv-text-muted', hex: '#565656' },
  { name: 'fond gris', token: '--lpv-grey-bg', hex: '#f4f5f6' },
  { name: 'fond gris foncé', token: '--lpv-darkgrey-bg', hex: '#ececec' },
  { name: 'bordure', token: '--lpv-grey-border', hex: '#d8dadc' },
  { name: 'surface', token: '--lpv-surface', hex: '#f8f8f8' },
  { name: 'fond feedback', token: '--lpv-bg-feedback', hex: '#fff8f8' },
]

function Swatch({ item }: { item: SwatchData }) {
  return (
    <div className="lpv-ds-swatch">
      <span
        className="lpv-ds-swatch__color"
        style={{ backgroundColor: `var(${item.token})` }}
      />
      <span className="lpv-ds-swatch__name">{item.name}</span>
      <span className="lpv-ds-swatch__hex">
        {item.token} · {item.hex}
      </span>
    </div>
  )
}

function SwatchGrid({ items }: { items: SwatchData[] }) {
  return (
    <div className="lpv-ds-swatch-grid">
      {items.map((item) => (
        <Swatch item={item} key={item.token} />
      ))}
    </div>
  )
}

export default function ColorsPage() {
  return (
    <div className="lpv-container">
      <p style={{ margin: '1rem 0' }}>
        <BackLink href="/design-system">Design system</BackLink>
      </p>
      <h1 className="lpv-h1">Couleurs</h1>
      <p className="lpv-muted">
        Utilisez toujours la palette LPV Board. Les swatches ci-dessous utilisent les
        variables CSS : ils reflètent le thème actif — repassez en mode sombre pour voir
        la palette s&apos;assombrir. Les valeurs hex affichées documentent le thème clair.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Contraste</h2>
        <p>
          Vérifiez que le rapport de contraste des textes et des éléments interactifs
          respecte le critère <strong>WCAG 2.2 — 1.4.3 Contraste (minimum), niveau AA</strong>{' '}
          (4,5:1 pour du texte normal, 3:1 pour du texte large ou gras).
        </p>
        <p className="lpv-muted">
          Ne copiez jamais les valeurs hex : référencez toujours les variables CSS
          (<code>var(--lpv-…)</code>) pour que les surcharges du mode sombre s&apos;appliquent.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Couleurs fonctionnelles</h2>
        <p className="lpv-muted">
          Un jeu de couleurs réservé aux éléments essentiels de la page : elles rendent
          les interactions prévisibles d&apos;un composant à l&apos;autre.
        </p>
        <SwatchGrid items={FUNCTIONAL} />
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Palette</h2>
        <p className="lpv-muted">
          Chaque groupe décline une couleur de la charte : la variante principale, un fond
          doux (tint) et une nuance foncée (shade) pour les états survol/hover.
        </p>
        {GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: '1.75rem' }}>
            <h3 className="lpv-h3">{group.title}</h3>
            <SwatchGrid items={group.swatches} />
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Tags</h2>
        <p className="lpv-muted">
          Couleurs de statut des tags : identiques en mode clair et sombre. Chaque tag
          existe en version pleine (fond coloré) et douce (fond éclairci + texte assombri).
        </p>
        <h3 className="lpv-h3">Pleines</h3>
        <SwatchGrid items={TAG_COLORS} />
        <h3 className="lpv-h3">Doux (fond + texte)</h3>
        <SwatchGrid items={TAG_SOFT} />
      </section>

      <section>
        <h2 className="lpv-h2">Neutres</h2>
        <SwatchGrid items={NEUTRALS} />
      </section>
    </div>
  )
}