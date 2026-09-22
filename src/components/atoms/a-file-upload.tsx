import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

// Atome : téléversement de fichier (input file) avec label, hint et erreur.
// Inspiré de GOV.UK File upload. Version de base sans JS amélioré (drop zone).
// L'erreur s'applique au groupe de formulaire complet.
export function FileUpload({
  id,
  name,
  label,
  hint,
  erreur,
  accept,
  multiple = false,
  optionnel = false,
  onChange,
  describedBy,
}: {
  id: string
  name: string
  label: string
  hint?: string
  erreur?: string
  accept?: string
  multiple?: boolean
  optionnel?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  describedBy?: string
}) {
  const ids: string[] = []
  if (hint) ids.push(`${describedBy ?? id}-hint`)
  if (erreur) ids.push(`${describedBy ?? id}-error`)
  const ariaDescribedBy = ids.length > 0 ? ids.join(' ') : undefined
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`

  return (
    <div className={groupeClasse}>
      <Label htmlFor={id} optionnel={optionnel}>{label}</Label>
      {hint ? <Hint id={`${describedBy ?? id}-hint`}>{hint}</Hint> : null}
      {erreur ? <ErrorMessage id={`${describedBy ?? id}-error`}>{erreur}</ErrorMessage> : null}
      <input
        accept={accept}
        aria-describedby={ariaDescribedBy || undefined}
        aria-invalid={erreur ? true : undefined}
        className={`lpv-file-upload${erreur ? ' lpv-file-upload--error' : ''}`}
        id={id}
        multiple={multiple}
        name={name}
        onChange={onChange}
        type="file"
      />
    </div>
  )
}
