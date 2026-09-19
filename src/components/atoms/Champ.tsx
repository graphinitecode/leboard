// Atomes typographiques de champ : Label, Hint, ErrorMessage

export function Label({ htmlFor, children, requis }: { htmlFor: string; children: string; requis?: boolean }) {
  return (
    <label className="lpv-label" htmlFor={htmlFor}>
      {children}
      {requis ? <span aria-hidden="true"> *</span> : null}
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