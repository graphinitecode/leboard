'use client'

import { useState } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/a-label'

type TailleLabel = 'l' | 'm' | 's'

export type OptionCase = {
  valeur: string
  texte: string
  hint?: string
  coche?: boolean
  diviseur?: never
  conditionnel?: React.ReactNode
  disabled?: boolean
} | {
  diviseur: string
  valeur?: never
  texte?: never
  hint?: never
  coche?: never
  conditionnel?: never
  disabled?: never
}

// Molécule : une option de case à cocher avec révélation conditionnelle.
// Composant séparé pour respecter les règles des hooks (pas de useState dans une boucle).
function OptionAvecRevelation({
  option,
  optionId,
  hintId,
  conditionalId,
  nom,
  onChangeExterne,
}: {
  option: OptionCase & { diviseur?: never }
  optionId: string
  hintId: string | undefined
  conditionalId: string | undefined
  nom: string
  onChangeExterne?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [revealed, setRevealed] = useState(option.coche ?? false)

  return (
    <div key={option.valeur}>
      <div className="lpv-cases__item">
        <input
          aria-describedby={hintId}
          checked={option.coche}
          className="lpv-cases__input"
          data-aria-controls={conditionalId}
          disabled={option.disabled}
          id={optionId}
          name={nom}
          onChange={(e) => {
            setRevealed(e.target.checked)
            onChangeExterne?.(e)
          }}
          type="checkbox"
          value={option.valeur}
        />
        <label className="lpv-label lpv-cases__label" htmlFor={optionId}>
          {option.texte}
        </label>
        {option.hint ? (
          <div className="lpv-hint lpv-cases__hint" id={hintId}>
            {option.hint}
          </div>
        ) : null}
      </div>
      {option.conditionnel ? (
        <div
          className={`lpv-cases__conditionnel${revealed ? '' : ' lpv-cases__conditionnel--hidden'}`}
          id={conditionalId}
        >
          {option.conditionnel}
        </div>
      ) : null}
    </div>
  )
}

export function Checkbox({
  nom,
  options,
  idPrefix,
  hint,
  erreur,
  isPageHeading,
  tailleLegende = 'l',
  onChange,
}: {
  nom: string
  options: OptionCase[]
  idPrefix?: string
  hint?: string
  erreur?: string
  isPageHeading?: boolean
  tailleLegende?: TailleLabel
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const prefix = idPrefix ?? nom
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${prefix}-hint`)
  if (erreur) ariaDescribedByParts.push(`${prefix}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined

  return (
    <div className={groupeClasse}>
      <fieldset aria-describedby={ariaDescribedBy} className="lpv-fieldset">
        {isPageHeading ? (
          <legend className={`lpv-fieldset__legende${tailleLegende !== 'l' ? ` lpv-fieldset__legende--${tailleLegende}` : ''}`}>
            <h1 className="lpv-fieldset__titre">{nom}</h1>
          </legend>
        ) : (
          <legend className={`lpv-fieldset__legende${tailleLegende !== 'l' ? ` lpv-fieldset__legende--${tailleLegende}` : ''}`}>
            {nom}
          </legend>
        )}
        {hint ? <Hint id={`${prefix}-hint`}>{hint}</Hint> : null}
        {erreur ? <ErrorMessage id={`${prefix}-error`}>{erreur}</ErrorMessage> : null}
        <div className="lpv-cases">
          {options.map((option, index) => {
            if (option.diviseur) {
              return (
                <div className="lpv-cases__diviseur" key={`divider-${index}`}>
                  {option.diviseur}
                </div>
              )
            }

            const optionId = `${prefix}-${index + 1}`
            const hintId = option.hint ? `${optionId}-hint` : undefined
            const conditionalId = option.conditionnel ? `${optionId}-conditionnel` : undefined

            return (
              <OptionAvecRevelation
                conditionalId={conditionalId}
                hintId={hintId}
                key={option.valeur}
                nom={nom}
                onChangeExterne={onChange}
                option={option as OptionCase & { diviseur?: never; valeur: string; texte: string }}
                optionId={optionId}
              />
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
