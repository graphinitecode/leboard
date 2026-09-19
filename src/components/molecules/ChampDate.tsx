import { ErrorMessage, Hint, Label } from '@/components/atoms/Champ'

// Molécule : saisie de date (3 champs jour/mois/année).
// Inspiré de GOV.UK Date input. Fieldset avec role="group", legend,
// hint, erreur. Champs inputmode numeric, autocomplete bday-* optionnel.
// Les erreurs peuvent cibler tous les champs ou un seul (jour/mois/année).
export function ChampDate({
  id,
  namePrefix,
  label,
  hint,
  erreur,
  isPageHeading,
  valeurs,
  jourErreur,
  moisErreur,
  anneeErreur,
  autoCompletePrefix,
  jourAutocomplete,
  moisAutocomplete,
  anneeAutocomplete,
  optionnel,
}: {
  id: string
  namePrefix?: string
  label: string
  hint?: string
  erreur?: string
  isPageHeading?: boolean
  valeurs?: { jour?: string; mois?: string; annee?: string }
  jourErreur?: boolean
  moisErreur?: boolean
  anneeErreur?: boolean
  autoCompletePrefix?: string
  jourAutocomplete?: string
  moisAutocomplete?: string
  anneeAutocomplete?: string
  optionnel?: boolean
}) {
  const prefix = namePrefix ?? id
  const groupeClasse = `lpv-form-group${erreur ? ' lpv-form-group--error' : ''}`
  const ariaDescribedByParts: string[] = []
  if (hint) ariaDescribedByParts.push(`${id}-hint`)
  if (erreur) ariaDescribedByParts.push(`${id}-error`)
  const ariaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined

  const labelElement = (
    <Label htmlFor={`${id}-jour`} optionnel={optionnel} isPageHeading={isPageHeading}>
      {label}
    </Label>
  )

  return (
    <div className={groupeClasse}>
      {isPageHeading ? labelElement : labelElement}
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {erreur ? <ErrorMessage id={`${id}-error`}>{erreur}</ErrorMessage> : null}
      <fieldset aria-describedby={ariaDescribedBy} className="lpv-fieldset" role="group">
        <legend className="lpv-fieldset__legende lpv-sr-only">{label}</legend>
        <div className="lpv-champ-date">
          <div className="lpv-champ-date__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-champ-date__label" htmlFor={`${id}-jour`}>
                Jour
              </label>
              <input
                autoComplete={jourAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-day` : undefined)}
                className={`lpv-input lpv-champ-date__input lpv-input--width-2${jourErreur ? ' lpv-input--error' : ''}`}
                id={`${id}-jour`}
                inputMode="numeric"
                maxLength={2}
                name={`${prefix}-jour`}
                pattern="[0-9]*"
                type="text"
                defaultValue={valeurs?.jour}
              />
            </div>
          </div>
          <div className="lpv-champ-date__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-champ-date__label" htmlFor={`${id}-mois`}>
                Mois
              </label>
              <input
                autoComplete={moisAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-month` : undefined)}
                className={`lpv-input lpv-champ-date__input lpv-input--width-2${moisErreur ? ' lpv-input--error' : ''}`}
                id={`${id}-mois`}
                inputMode="numeric"
                maxLength={2}
                name={`${prefix}-mois`}
                pattern="[0-9]*"
                type="text"
                defaultValue={valeurs?.mois}
              />
            </div>
          </div>
          <div className="lpv-champ-date__item">
            <div className="lpv-form-group">
              <label className="lpv-label lpv-champ-date__label" htmlFor={`${id}-annee`}>
                Année
              </label>
              <input
                autoComplete={anneeAutocomplete ?? (autoCompletePrefix ? `${autoCompletePrefix}-year` : undefined)}
                className={`lpv-input lpv-champ-date__input lpv-input--width-4${anneeErreur ? ' lpv-input--error' : ''}`}
                id={`${id}-annee`}
                inputMode="numeric"
                maxLength={4}
                name={`${prefix}-annee`}
                pattern="[0-9]*"
                type="text"
                defaultValue={valeurs?.annee}
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  )
}