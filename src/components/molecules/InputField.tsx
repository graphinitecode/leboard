import type { ReactNode } from 'react'

import { ErrorMessage, Hint } from '@/components/atoms/Label'

type TailleLegende = 'l' | 'm' | 's'

// Molécule : ensemble de champs (<fieldset> + <legend>).
// Utilisée par CasesACocher, BoutonsRadio, ChampDate, et tout groupe
// de champs apparentés (ex. adresse).
//
// Guide GOV.UK « Making labels and legends headings » :
// - isPageHeading place le <h1> DANS la <legend> (pas autour).
// - taille pilote la classe de légende : 'l' (défaut), 'm', 's'.
// - Le fieldset regroupe visuellement et accessiblement les champs du groupe.
// - describedBy relie le fieldset au hint et/ou à l'erreur du groupe.
export function InputField({
  children,
  legende,
  taille = 'l',
  isPageHeading,
  hint,
  erreur,
  describedBy,
  role,
}: {
  children: ReactNode
  legende: string
  taille?: TailleLegende
  isPageHeading?: boolean
  hint?: string
  erreur?: string
  describedBy?: string
  role?: string
}) {
  const classeTaille = taille !== 'l' ? ` lpv-fieldset__legende--${taille}` : ''
  const ids: string[] = []
  if (hint) ids.push(`${describedBy ?? ''}-hint`)
  if (erreur) ids.push(`${describedBy ?? ''}-error`)
  const ariaDescribedBy = ids.length > 0 ? ids.join(' ') : undefined

  return (
    <fieldset
      aria-describedby={ariaDescribedBy}
      className="lpv-fieldset"
      role={role}
    >
      <legend className={`lpv-fieldset__legende${classeTaille}`}>
        {isPageHeading ? <h1 className="lpv-fieldset__titre">{legende}</h1> : legende}
      </legend>
      {hint ? <Hint id={`${describedBy ?? ''}-hint`}>{hint}</Hint> : null}
      {erreur ? <ErrorMessage id={`${describedBy ?? ''}-error`}>{erreur}</ErrorMessage> : null}
      {children}
    </fieldset>
  )
}
