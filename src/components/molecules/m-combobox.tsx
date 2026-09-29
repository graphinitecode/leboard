'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react'

import { ErrorMessage, Hint, Label } from '@/components/atoms/a-label'
import { normaliserTexte } from '@/shared/ui/normalize-text'

// Molécule : recherche type-ahead (pattern ARIA « combobox with list autocomplete »).
// Le filtre porte sur le label ET le sous-titre, insensible à la casse et aux
// accents ; le focus reste sur l'input et la liste n'est montée que si ouverte.
export type ComboboxOption<T = unknown> = {
  /** Stable : clé React et suffixe d'id DOM (aria-activedescendant). */
  id: string
  /** Libellé principal (filtré). */
  label: string
  /** Sous-titre (métadonnées, filtrable aussi). */
  sublabel?: string
  /** Affichée mais non sélectionnable (sautée au clavier). */
  disabled?: boolean
  /** Payload retourné à la sélection. */
  value: T
}

export function Combobox<T = unknown>({
  ariaLabel,
  id,
  label,
  hint,
  error,
  placeholder,
  options,
  maxResults = 6,
  value = null,
  onChange,
  noResultsLabel = 'Aucun résultat',
}: {
  /** Nom accessible de l'input quand aucun label visible n'est rendu (label=""). */
  ariaLabel?: string
  id: string
  label: string
  hint?: string
  error?: string
  placeholder?: string
  options: ComboboxOption<T>[]
  maxResults?: number
  /** Sélection courante : sert seulement à l'affichage initial de l'input. */
  value?: T | null
  onChange: (option: ComboboxOption<T>) => void
  noResultsLabel?: string
}) {
  const conteneurRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState(() => {
    const optionInitiale =
      value == null ? null : options.find((option) => option.value === value)
    return optionInitiale?.label ?? ''
  })
  const [ouvert, setOuvert] = useState(false)
  const [indexActif, setIndexActif] = useState<number | null>(null)

  const resultats = useMemo(() => {
    const recherche = normaliserTexte(query)
    if (!recherche) return []
    return options
      .filter((option) =>
        normaliserTexte(`${option.label} ${option.sublabel ?? ''}`).includes(recherche),
      )
      .slice(0, maxResults)
  }, [options, query, maxResults])

  // Clic extérieur : ferme la liste (listener posé seulement si ouverte).
  useEffect(() => {
    if (!ouvert) return
    const fermerSiExterieur = (e: MouseEvent) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', fermerSiExterieur)
    return () => document.removeEventListener('mousedown', fermerSiExterieur)
  }, [ouvert])

  const choisir = (option: ComboboxOption<T>) => {
    if (option.disabled) return
    onChange(option)
    setQuery('')
    setOuvert(false)
    setIndexActif(null)
  }

  // Prochaine option activable en partant de « depuis » (exclu), en sautant
  // les désactivées et en bouclant ; null si tout est désactivé.
  const prochaineOptionActive = (depuis: number, direction: 1 | -1): number | null => {
    const total = resultats.length
    for (let i = 1; i <= total; i += 1) {
      const index = (((depuis + direction * i) % total) + total) % total
      if (!resultats[index]?.disabled) return index
    }
    return null
  }

  const surTouche = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (resultats.length === 0) return
      if (!ouvert) setOuvert(true)
      const direction = e.key === 'ArrowDown' ? 1 : -1
      const depuis = indexActif ?? (direction === 1 ? -1 : resultats.length)
      setIndexActif(prochaineOptionActive(depuis, direction))
      return
    }
    if (e.key === 'Enter') {
      const option = ouvert && indexActif != null ? resultats[indexActif] : undefined
      if (option && !option.disabled) {
        e.preventDefault()
        choisir(option)
      }
      return
    }
    if (e.key === 'Escape' && ouvert) {
      e.preventDefault()
      setOuvert(false)
    }
  }

  // Le preventDefault des options garde le focus sur l'input (pas de blur
  // parasite avant le clic) ; le blur ferme si le focus sort du conteneur.
  const surFlou = (e: FocusEvent<HTMLInputElement>) => {
    const cible = e.relatedTarget as Node | null
    if (conteneurRef.current && (!cible || !conteneurRef.current.contains(cible))) {
      setOuvert(false)
    }
  }

  const surSaisie = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setOuvert(e.target.value.trim() !== '')
    setIndexActif(null)
  }

  const listeId = `${id}-liste`
  const optionId = (index: number) => `${id}-option-${index}`
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')
  const nomListe = label || ariaLabel
  const groupeClass = `lpv-m-combobox lpv-form-group${error ? ' lpv-form-group--error' : ''}`
  const inputClass = `lpv-a-input lpv-m-combobox__input${error ? ' lpv-a-input--error' : ''}`

  return (
    <div className={groupeClass} ref={conteneurRef}>
      {label && <Label htmlFor={id}>{label}</Label>}
      {hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
      {error ? <ErrorMessage id={`${id}-error`}>{error}</ErrorMessage> : null}
      <input
        aria-activedescendant={ouvert && indexActif != null ? optionId(indexActif) : undefined}
        aria-autocomplete="list"
        aria-controls={ouvert ? listeId : undefined}
        aria-describedby={describedBy || undefined}
        aria-expanded={ouvert}
        aria-invalid={error ? true : undefined}
        aria-label={ariaLabel}
        autoComplete="off"
        className={inputClass}
        id={id}
        name={id}
        onBlur={surFlou}
        onChange={surSaisie}
        onKeyDown={surTouche}
        placeholder={placeholder}
        role="combobox"
        type="text"
        value={query}
      />
      <span aria-live="polite" className="lpv-visually-hidden">
        {ouvert && resultats.length > 0
          ? `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} disponibles`
          : ''}
      </span>
      {ouvert ? (
        <ul aria-label={nomListe} className="lpv-m-combobox__list" id={listeId} role="listbox">
          {resultats.length === 0 ? (
            <li
              aria-disabled="true"
              aria-selected={false}
              className="lpv-m-combobox__no-results"
              role="option"
            >
              {noResultsLabel}
            </li>
          ) : (
            resultats.map((option, index) => (
              <li
                aria-disabled={option.disabled || undefined}
                aria-selected={index === indexActif ? true : undefined}
                className={[
                  'lpv-m-combobox__option',
                  index === indexActif ? 'lpv-m-combobox__option--active' : '',
                  option.disabled ? 'lpv-m-combobox__option--disabled' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                id={optionId(index)}
                key={option.id}
                onClick={() => choisir(option)}
                onMouseDown={(e: ReactMouseEvent) => e.preventDefault()}
                role="option"
              >
                <span className="lpv-m-combobox__option-label">{option.label}</span>
                {option.sublabel ? (
                  <span className="lpv-m-combobox__option-sub">{option.sublabel}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}