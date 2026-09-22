// Atomes typographiques de champ : Label, Hint, ErrorMessage
//
// Convention des labels : un champ sans mention « (optional) » est obligatoire.
// L'astérisque n'est pas utilisée — la mention suffit (pas de sémantique couleur/seule).
//
// Guide GOV.UK « Making labels and legends headings » :
// - isPageHeading enveloppe le label dans un <h1> (page-question).
// - size pilote la classe de taille : 'l' (défaut), 'm', 's'.

type LabelSize = 'l' | 'm' | 's'

export function Label({
  htmlFor,
  children,
  optional,
  isPageHeading,
  size,
}: {
  htmlFor: string
  children: string
  optional?: boolean
  isPageHeading?: boolean
  size?: LabelSize
}) {
  const sizeClass = size && size !== 'l' ? ` lpv-a-label--${size}` : ''
  const classes = `lpv-a-label${sizeClass}`

  const label = (
    <label className={classes} htmlFor={htmlFor}>
      {children}
      {optional ? <span className="lpv-a-label__optional"> (optional)</span> : null}
    </label>
  )

  if (isPageHeading) {
    return <h1 className="lpv-a-label-wrapper">{label}</h1>
  }

  return label
}

export function Hint({ id, children }: { id: string; children: string }) {
  return (
    <div className="lpv-a-hint" id={id}>
      {children}
    </div>
  )
}

export function ErrorMessage({ id, children }: { id: string; children: string }) {
  return (
    <p className="lpv-a-error-message" id={id}>
      <span className="lpv-visually-hidden">Erreur : </span>
      {children}
    </p>
  )
}