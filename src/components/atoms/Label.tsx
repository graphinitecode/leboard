// Atomes typographiques de champ : Label, Hint, ErrorMessage
//
// Convention des labels : un champ SANS mention « (optionnel) » est obligatoire.
// L'astérisque n'est pas utilisée — la mention suffit (pas de sémantique couleur/seule).
//
// Guide GOV.UK « Making labels and legends headings » :
// - isPageHeading enveloppe le label dans un <h1> (page-question).
// - taille pilote la classe de taille : 'l' (défaut), 'm', 's'.

type TailleLabel = 'l' | 'm' | 's'

export function Label({
  htmlFor,
  children,
  optionnel,
  isPageHeading,
  taille,
}: {
  htmlFor: string
  children: string
  optionnel?: boolean
  isPageHeading?: boolean
  taille?: TailleLabel
}) {
  const classeTaille = taille && taille !== 'l' ? ` lpv-label--${taille}` : ''
  const classe = `lpv-label${classeTaille}`

  const label = (
    <label className={classe} htmlFor={htmlFor}>
      {children}
      {optionnel ? <span className="lpv-label__optionnel"> (optionnel)</span> : null}
    </label>
  )

  if (isPageHeading) {
    return <h1 className="lpv-label-wrapper">{label}</h1>
  }

  return label
}

export function Hint({ id, children }: { id: string; children: string }) {
  return (
    <div className="lpv-hint" id={id}>
      {children}
    </div>
  )
}

export function ErrorMessage({ id, children }: { id: string; children: string }) {
  return (
    <p className="lpv-error-message" id={id}>
      <span className="lpv-visually-hidden">Erreur : </span>
      {children}
    </p>
  )
}