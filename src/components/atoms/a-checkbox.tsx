'use client'

// Atome : case à cocher isolée, sans fieldset ni légende — pensée pour la
// sélection de lignes dans un tableau. Le libellé est uniquement vocal
// (aria-label) : l'entête de colonne fournit le contexte visuel.
export function SoloCheckbox({
  checked = false,
  disabled = false,
  label,
  onChange,
}: {
  checked?: boolean
  disabled?: boolean
  /** Libellé lu par les lecteurs d'écran (la colonne fournit le contexte visuel). */
  label: string
  onChange?: (next: boolean) => void
}) {
  return (
    <input
      aria-label={label}
      checked={checked}
      className="lpv-a-checkbox"
      disabled={disabled}
      onChange={(event) => {
        onChange?.(event.target.checked)
      }}
      type="checkbox"
    />
  )
}