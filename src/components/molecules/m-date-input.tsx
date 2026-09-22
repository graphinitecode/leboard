import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'

// Molécule : saisie de date (3 champs jour/mois/année).
// Inspiré de GOV.UK Date input. Fieldset avec role="group", legend,
// hint, erreur. Champs inputmode numeric, autocomplete bday-* optionnel.
// Les erreurs peuvent cibler tous les champs ou un seul (jour/mois/année).
export function DateInput({
  id,
  namePrefix,
  label,
  hint,
  error,
  isPageHeading,
  values,
  dayError,
  monthError,
  yearError,
  autoCompletePrefix,
  dayAutocomplete,
  monthAutocomplete,
  yearAutocomplete,
  optional,
}: {
  id: string
  namePrefix?: string
  label: string
  hint?: string
  error?: string
  isPageHeading?: boolean
  values?: { day?: string; month?: string; year?: string }
  dayError?: boolean
  monthError?: boolean
  yearError?: boolean
  autoCompletePrefix?: string
  dayAutocomplete?: string
  monthAutocomplete?: string
  yearAutocomplete?: string
  optional?: boolean
}) {
  const prefix = namePrefix ?? id
  const groupClass = `lpv-form-group${error ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${id}-hint`)
  if (error) ariaDescribedByParts.push(`${id}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined

  const labelElement = (
    <Label htmlFor={`${id}-day`} optional={optional} isPageHeading={isPageHeading}>
      {label}
    </Label>
  )

  return (
    <div className={groupClass}>
      {isPageHeading ? labelElement : labelElement}
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage> : null}
      <fieldset aria-describedby={ariaDescribedBy} className="lpv-fieldset" role="group">
        <legend className="lpv-fieldset__legend lpv-visually-hidden">{label}</legend>
        <div className="lpv-m-date-input">
          <div className="lpv-m-date-input__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-m-date-input__label" htmlFor={`${id}-day`}>
                Jour
              </label>
              <input
                autoComplete={dayAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-day` : undefined)}
                className={`lpv-a-input lpv-m-date-input__input lpv-a-input--width-2${dayError ? ' lpv-a-input--error' : ''}`}
                id={`${id}-day`}
                inputMode="numeric"
                maxLength={2}
                name={`${prefix}-day`}
                pattern="[0-9]*"
                type="text"
                defaultValue={values?.day}
              />
            </div>
          </div>
          <div className="lpv-m-date-input__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-m-date-input__label" htmlFor={`${id}-month`}>
                Mois
              </label>
              <input
                autoComplete={monthAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-month` : undefined)}
                className={`lpv-a-input lpv-m-date-input__input lpv-a-input--width-2${monthError ? ' lpv-a-input--error' : ''}`}
                id={`${id}-month`}
                inputMode="numeric"
                maxLength={2}
                name={`${prefix}-month`}
                pattern="[0-9]*"
                type="text"
                defaultValue={values?.month}
              />
            </div>
          </div>
          <div className="lpv-m-date-input__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-m-date-input__label" htmlFor={`${id}-year`}>
                Année
              </label>
              <input
                autoComplete={yearAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-year` : undefined)}
                className={`lpv-a-input lpv-m-date-input__input lpv-a-input--width-4${yearError ? ' lpv-a-input--error' : ''}`}
                id={`${id}-year`}
                inputMode="numeric"
                maxLength={4}
                name={`${prefix}-year`}
                pattern="[0-9]*"
                type="text"
                defaultValue={values?.year}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  )
}
