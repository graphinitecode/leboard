'use client'

import { useState } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/Label'

type TailleLegende = 'l' | 'm' | 's'

export type OptionRadio = {
  valeur: string
  texte: string
  hint?: string
  diviseur?: never
  conditionnel?: React.ReactNode
  disabled?: boolean
} | {
  diviseur: string
  valeur?: never
  texte?: never
  hint?: never
  conditionnel?: never
  disabled?: never
}

// Molécule : boutons radio. Inspiré de GOV.UK Radios.
// - Fieldset + legend (isPageHeading possible)
// - Divider « ou »
// - Variante inline (enLigne) pour 2 options courtes
// - Révélation conditionnelle
// - Small (petit) pour filtres de résultats
export function Radios({
  nom,
  options,
  idPrefix,
  hint,
  erreur,
  valeur,
  isPageHeading,
  tailleLegende = 'l',
  enLigne = false,
  petit = false,
  onChange,
}: {
  nom: string
  options: OptionRadio[]
  idPrefix?: string
  hint?: string
  erreur?: string
  valeur?: string
  isPageHeading?: boolean
  tailleLegende?: TailleLegende
  enLigne?: boolean
  petit?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const prefix = idPrefix ?? nom
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${prefix}-hint`)
  if (erreur) ariaDescribedByParts.push(`${prefix}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined
  const classesConteneur = `lpv-radios${enLigne ? ' lpv-radios--inline' : ''}${petit ? ' lpv-radios--small' : ''}`

  const [revealedConditional, setRevealedConditional] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    options.forEach((opt) => {
      if (opt.conditionnel && valeur === opt.valeur) {
        init[opt.valeur] = true
      }
    })
    return init
  })

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
        <div className={classesConteneur}>
          {options.map((option, index) => {
            if (option.diviseur) {
              return (
                <div className="lpv-radios__diviseur" key={`divider-${index}`}>
                  {option.diviseur}
                </div>
              )
            }

            const optionId = `${prefix}-${index + 1}`
            const hintId = option.hint ? `${optionId}-hint` : undefined
            const conditionalId = option.conditionnel ? `${optionId}-conditionnel` : undefined

            return (
              <div key={option.valeur}>
                <div className="lpv-radios__item">
                  <input
                    aria-describedby={hintId}
                    checked={valeur === option.valeur}
                    className="lpv-radios__input"
                    data-aria-controls={conditionalId}
                    disabled={option.disabled}
                    id={optionId}
                    name={nom}
                    onChange={(e) => {
                      const newRevealed: Record<string, boolean> = {}
                      options.forEach((opt) => {
                        if (opt.conditionnel) {
                          newRevealed[opt.valeur] = opt.valeur === e.target.value
                        }
                      })
                      setRevealedConditional(newRevealed)
                      onChange?.(e)
                    }}
                    type="radio"
                    value={option.valeur}
                  />
                  <label className="lpv-label lpv-radios__label" htmlFor={optionId}>
                    {option.texte}
                  </label>
                  {option.hint ? (
                    <div className="lpv-hint lpv-radios__hint" id={hintId}>
                      {option.hint}
                    </div>
                  ) : null}
                </div>
                {option.conditionnel ? (
                  <div
                    className={`lpv-radios__conditionnel${revealedConditional[option.valeur] ? '' : ' lpv-radios__conditionnel--hidden'}`}
                    id={conditionalId}
                  >
                    {option.conditionnel}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}
