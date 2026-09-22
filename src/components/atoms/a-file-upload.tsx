import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'
import { Icon } from '@/components/atoms/a-icon'

// Atome : téléversement de fichier (input file) avec label, hint et erreur.
// Inspiré de GOV.UK File upload. Version de base sans JS amélioré (drop zone).
// L'erreur s'applique au groupe de formulaire complet.
export function FileUpload({
  id,
  name,
  label,
  hint,
  error,
  accept,
  multiple = false,
  optional = false,
  onChange,
  describedBy,
}: {
  id: string
  name: string
  label: string
  hint?: string
  error?: string
  accept?: string
  multiple?: boolean
  optional?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  describedBy?: string
}) {
  const ids: string[] = []
  if (hint) ids.push(`${describedBy ?? id}-hint`)
  if (error) ids.push(`${describedBy ?? id}-error`)
  const ariaDescribedBy = ids.length > 0 ? ids.join(' ') : undefined
  const groupeClasse = `lpv-form-group${error ? ' lpv-form-group--error' : ''}`

  return (
    <div className={groupeClasse}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      {hint ? <Hint id={`${describedBy ?? id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${describedBy ?? id}-error`}>{error}</ErrorMessage> : null}
      <input
        accept={accept}
        aria-describedby={ariaDescribedBy || undefined}
        aria-invalid={error ? true : undefined}
        className={`lpv-a-file-upload${error ? ' lpv-a-file-upload--error' : ''}`}
        id={id}
        multiple={multiple}
        name={name}
        onChange={onChange}
        type="file"
      />
      <Icon icon="rivet-icons:download" size={22} className="lpv-a-file-upload__icon" />
    </div>
  )
}
