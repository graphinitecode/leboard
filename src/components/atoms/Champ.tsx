// Atomes typographiques de champ : Label, Hint, ErrorMessage
//
// Convention des labels : un champ SANS mention « (optionnel) » est obligatoire.
// L'astérisque n'est pas utilisée — la mention suffit (pas de sémantique couleur/seule).

export function Label({ htmlFor, children, optionnel }: { htmlFor: string; children: string; optionnel?: boolean }) {
  return (
    <label className="lpv-label" htmlFor={htmlFor}>
      {children}
      {optionnel ? <span className="lpv-label__optionnel"> (optionnel)</span> : null}
    </label>
  )
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
      {children}
    </p>
  )
}