import type { Metadata } from 'next'

import { BackLink } from '@/components/atoms'

export const metadata: Metadata = {
  title: 'Typographie — Design system LPV Board',
  robots: { index: false, follow: false },
}

interface TypeSpecimen {
  name: string
  className: string
  sample: string
  point: string | null
  mobile: string
  tablet: string
  desktop: string
}

/* tailles/line-height en px, par palier — documentées, le rendu réel vient de la classe */
const SPECIMENS: TypeSpecimen[] = [
  {
    name: 'h1',
    className: 'lpv-h1',
    sample: 'Titre de niveau 1',
    point: '48',
    mobile: '32px / 35px',
    tablet: '40px / 45px',
    desktop: '48px / 50px',
  },
  {
    name: 'h2',
    className: 'lpv-h2',
    sample: 'Titre de niveau 2',
    point: '24',
    mobile: '21px / 25px',
    tablet: '24px / 30px',
    desktop: '24px / 30px',
  },
  {
    name: 'h3',
    className: 'lpv-h3',
    sample: 'Titre de niveau 3',
    point: '19',
    mobile: '19px / 25px',
    tablet: '19px / 25px',
    desktop: '19px / 25px',
  },
  {
    name: 'body',
    className: 'lpv-muted',
    sample: 'Texte courant (muted)',
    point: null,
    mobile: '16px',
    tablet: '16px',
    desktop: '16px',
  },
]

export default function TypographyPage() {
  return (
    <div className="lpv-container">
      <p style={{ margin: '1rem 0' }}>
        <BackLink href="/design-system">Design system</BackLink>
      </p>
      <h1 className="lpv-h1">Typographie</h1>
      <p className="lpv-muted">
        Échelle typographique responsive inspirée du{' '}
        <a href="https://design-system.service.gov.uk/styles/type-scale/">type scale GOV.UK</a> :
        les titres s&apos;adaptent à la taille de l&apos;écran selon trois paliers. Les specimens
        ci-dessous sont rendus avec les vraies classes — redimensionnez la fenêtre pour voir les
        tailles changer.
      </p>

      <section style={{ marginBottom: '3rem' }}>
        <h2 className="lpv-h2">Type scale</h2>
        <p className="lpv-muted">
          Chaque ligne affiche le point d&apos;échelle et les valeurs font-size / line-height
          (en px) pour chaque palier : mobile &lt; 48rem, tablet ≥ 48rem (Tailwind{' '}
          <code>md</code>), desktop ≥ 64rem (Tailwind <code>lg</code>).
        </p>
        <div className="lpv-ds-type-list">
          {SPECIMENS.map((item) => (
            <div className="lpv-ds-type-row" key={item.name}>
              <span className="lpv-ds-type-row__name">{item.name}</span>
              <span className={`lpv-ds-type-row__sample ${item.className}`}>{item.sample}</span>
              <span className="lpv-ds-type-row__meta">
                {item.point ? `point ${item.point}` : 'corps fixe'}
                <br />
                {item.mobile}
                <br />
                {item.tablet}
                <br />
                {item.desktop}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="lpv-h2">Règles</h2>
        <ul>
          <li>
            Jamais de texte sous 19px : les petites tailles ne rétrécissent pas en mobile
            (accessibilité — [GDS 2022](https://designnotes.blog.gov.uk/2022/12/12/making-the-gov-uk-frontend-typography-scale-more-accessible/)).
          </li>
          <li>
            Les line-heights sont des multiples de 5px pour un rythme vertical régulier, facile à
            scanner.
          </li>
          <li>
            Les tailles sont en <code>rem</code> : le texte suit le zoom navigateur (WCAG 2.1
            1.4.4 Resize text).
          </li>
          <li>
            Les grandes tailles rétrécissent en mobile (h1 : 48 → 40 → 32px) ; le corps de texte
            reste fixe.
          </li>
        </ul>
      </section>
    </div>
  )
}