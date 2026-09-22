'use client'

import { useState } from 'react'

import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

type LimiteType = 'caracteres' | 'mots'

// Molécule : compteur de caractères/mots. Inspiré de GOV.UK Character count.
// Affiche un message de compte sous le champ, ne bloque pas la saisie.
// Seuil : le message n'apparaît que quand le seuil (%) est dépassé.
// Annonce AT via aria-live="polite" quand le compteur change.
export function CharacterCount({
  id,
  name,
  label,
  hint,
  erreur,
  isPageHeading,
  limite,
  type = 'caracteres',
  seuil,
  valeur,
  onChange,
  rows = 5,
  optionnel = false,
  autoComplete,
}: {
  id: string
  name: string
  label: string
  hint?: string
  erreur?: string
  isPageHeading?: boolean
  limite: number
  type?: LimiteType
  seuil?: number
  valeur?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
  optionnel?: boolean
  autoComplete?: string
}) {
  const [texte, setTexte] = useState(valeur ?? '')
  const [aDepasseSeuil, setADepasseSeuil] = useState(false)
  const maxAtteint = type === 'caracteres' ? texte.length >= limite : (texte.trim().split(/\s+/).filter(Boolean).length >= limite)
  const nbActuel = type === 'caracteres' ? texte.length : texte.trim().split(/\s+/).filter(Boolean).length
  const nbRestant = limite - nbActuel

  function messageCompte(): string {
    if (maxAtteint) {
      return type === 'caracteres'
        ? `Vous avez dépassé la limite de ${limite} caractères de ${Math.abs(nbRestant)}`
        : `Vous avez dépassé la limite de ${limite} mots de ${Math.abs(nbRestant)}`
    }

    if (seuil && !aDepasseSeuil && nbActuel < limite * (seuil / 100)) {
      return type === 'caracteres'
        ? `Vous pouvez saisir jusqu'à ${limite} caractères`
        : `Vous pouvez saisir jusqu'à ${limite} mots`
    }

    return type === 'caracteres'
      ? `Il vous reste ${nbRestant} caractère${nbRestant > 1 ? 's' : ''}`
      : `Il vous reste ${nbRestant} mot${nbRestant > 1 ? 's' : ''}`
  }

  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''} lpv-compteur`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${id}-hint`)
  if (erreur) ariaDescribedByParts.push(`${id}-error`)
  ariaDescribedByParts.push(`${id}-compte`)
  const ariaDescribedBy = ariaDescribedByParts.join(' ')

  const labelElement = (
    <Label htmlFor={id} optionnel={optionnel} isPageHeading={isPageHeading}>
      {label}
    </Label>
  )

  return (
    <div className={groupeClasse} data-limite={limite} data-type-compteur={type} data-seuil={seuil}>
      {labelElement}
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {erreur ? <ErrorMessage id={`${id}-error`}>{erreur}</ErrorMessage> : null}
      <textarea
        aria-describedby={ariaDescribedBy}
        aria-invalid={erreur ? true : undefined}
        autoComplete={autoComplete}
        className={`lpv-textarea${erreur ? ' lpv-input--error' : ''} lpv-js-compteur`}
        defaultValue={valeur}
        id={id}
        name={name}
        onChange={(e) => {
          setTexte(e.target.value)
          const count = type === 'caracteres' ? e.target.value.length : e.target.value.trim().split(/\s+/).filter(Boolean).length
          setADepasseSeuil(seuil ? count >= limite * (seuil / 100) : true)
          onChange?.(e)
        }}
        rows={rows}
        value={valeur !== undefined ? valeur : undefined}
      />
      <div
        aria-live="polite"
        className={`lpv-hint lpv-compteur__message${maxAtteint ? ' lpv-compteur__message--erreur' : ''}`}
        id={`${id}-compte`}
      >
        {messageCompte()}
      </div>
    </div>
  )
}
