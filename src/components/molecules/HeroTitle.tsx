import type { ReactNode } from 'react'

// Molécule : hero façon GOV.UK — bandeau bleu pleine largeur, gros titre blanc,
// texte d'accroche et slot d'action (recherche, bouton, …). Vit dans le shell,
// sous l'entête de service.
export function HeroTitle({
  titre,
  texte,
  action,
}: {
  titre: string
  texte?: string
  action?: ReactNode
}) {
  return (
    <div className="lpv-hero" data-theme="light">
      <div className="lpv-hero__inner">
        <h1 className="lpv-hero__titre">{titre}</h1>
        {texte ? <p className="lpv-hero__texte">{texte}</p> : null}
        {action ? <div className="lpv-hero__action">{action}</div> : null}
      </div>
    </div>
  )
}