import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Combobox, type ComboboxOption } from '@/components/molecules'

const ELEVES: ComboboxOption<number>[] = [
  { id: 'eleve-1', label: 'Léa Martin', sublabel: 'CM2 · Groupe A', value: 1 },
  { id: 'eleve-2', label: 'Adam Roux', sublabel: 'CM1 · Groupe B', value: 2 },
  { id: 'eleve-3', label: 'Le Petit Prince', sublabel: 'A. de Saint-Exupéry', value: 3 },
]

const LIVRES_MIXTES: ComboboxOption<string>[] = [
  { id: 'livre-1', label: 'Premier dispo', value: 'a' },
  { id: 'livre-2', label: 'Indisponible', disabled: true, value: 'b' },
  { id: 'livre-3', label: 'Deuxième dispo', value: 'c' },
]

const rendreCombobox = <T,>(options: ComboboxOption<T>[], onChange = vi.fn()) => {
  render(
    <div>
      <Combobox hint="Tape pour chercher." id="demo" label="Recherche" onChange={onChange} options={options} />
      <button type="button">Extérieur</button>
    </div>,
  )
  return {
    input: screen.getByRole('combobox', { name: 'Recherche' }),
    onChange: onChange as ReturnType<typeof vi.fn>,
  }
}

describe('Combobox', () => {
  it('affiche le label, le hint et reste fermée sans saisie', () => {
    const { input } = rendreCombobox(ELEVES)
    expect(input).toHaveAttribute('aria-describedby', 'demo-hint')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it("utilise aria-label comme nom accessible en l absence de label visible", async () => {
    const user = userEvent.setup()
    render(
      <Combobox
        ariaLabel="Élève"
        hint="Tape un prénom ou un nom."
        id="sans-label"
        label=""
        onChange={vi.fn()}
        options={ELEVES}
        placeholder="Prénom ou nom…"
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Élève' })
    await user.type(input, 'lea')
    expect(input).toHaveAttribute('aria-controls', 'sans-label-liste')

    const liste = screen.getByRole('listbox', { name: 'Élève' })
    expect(within(liste).getByText('Léa Martin')).toBeDefined()
  })

  it('filtre les options sans se soucier des accents ni de la casse', async () => {
    const user = userEvent.setup()
    const { input } = rendreCombobox(ELEVES)

    await user.type(input, 'lea')
    const liste = screen.getByRole('listbox', { name: 'Recherche' })
    expect(input).toHaveAttribute('aria-controls', 'demo-liste')
    expect(within(liste).getAllByRole('option')).toHaveLength(1)
    expect(within(liste).getByText('Léa Martin')).toBeDefined()

    await user.clear(input)
    await user.type(input, 'SAINT-EXUPERY')
    expect(within(screen.getByRole('listbox')).getByText('Le Petit Prince')).toBeDefined()

    await user.clear(input)
    await user.type(input, 'CM2')
    expect(within(screen.getByRole('listbox')).getByText('Léa Martin')).toBeDefined()
  })

  it('limite le nombre de résultats affichés', async () => {
    const user = userEvent.setup()
    const huitLivres: ComboboxOption<number>[] = Array.from({ length: 8 }, (_, i) => ({
      id: `livre-${i + 1}`,
      label: `Livre ${i + 1}`,
      value: i + 1,
    }))
    const { input } = rendreCombobox(huitLivres)

    await user.type(input, 'livre')
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(6)
    expect(screen.queryByText('Livre 7')).toBeNull()

    await user.clear(input)
    await user.type(input, 'Livre 7')
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(1)
  })

  it('affiche les options désactivées mais ignore leur sélection à la souris', async () => {
    const user = userEvent.setup()
    const { input, onChange } = rendreCombobox(LIVRES_MIXTES)

    await user.type(input, 'dispo')
    const liste = screen.getByRole('listbox')
    expect(within(liste).getAllByRole('option')).toHaveLength(3)

    const indisponible = within(liste).getByText('Indisponible').closest('li')
    expect(indisponible).toHaveAttribute('aria-disabled', 'true')
    await user.click(within(liste).getByText('Indisponible'))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeDefined()
  })

  it('sautent les options désactivées au clavier', async () => {
    const user = userEvent.setup()
    const { input } = rendreCombobox(LIVRES_MIXTES)

    await user.type(input, 'dispo')
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', 'demo-option-0')

    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', 'demo-option-2')

    await user.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-activedescendant', 'demo-option-0')
  })

  it('sélectionne avec Entrée : onChange, input vidé, liste fermée', async () => {
    const user = userEvent.setup()
    const { input, onChange } = rendreCombobox(LIVRES_MIXTES)

    await user.type(input, 'dispo')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(LIVRES_MIXTES[0])
    expect(input).toHaveValue('')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('vide le champ au nettoyage : la liste se ferme', async () => {
    const user = userEvent.setup()
    const { input } = rendreCombobox(ELEVES)

    await user.type(input, 'lea')
    expect(screen.getByRole('listbox')).toBeDefined()

    await user.clear(input)
    expect(input).toHaveValue('')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('ferme avec Escape mais garde la saisie', async () => {
    const user = userEvent.setup()
    const { input } = rendreCombobox(ELEVES)

    await user.type(input, 'lea')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(input).toHaveValue('lea')
  })

  it('annonce qu\'aucun résultat n\'a été trouvé', async () => {
    const user = userEvent.setup()
    const { input } = rendreCombobox(ELEVES)

    await user.type(input, 'inconnu')
    const liste = screen.getByRole('listbox')
    expect(within(liste).getByText('Aucun résultat')).toBeDefined()
    const aucune = within(liste).getByText('Aucun résultat').closest('li')
    expect(aucune).toHaveAttribute('aria-disabled', 'true')
  })

  it('navigue au clavier et sélectionne l\'option active', async () => {
    const user = userEvent.setup()
    const { input, onChange } = rendreCombobox(ELEVES)

    await user.type(input, 'a')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')

    expect(input).toHaveAttribute('aria-activedescendant', 'demo-option-2')
    const active = within(screen.getByRole('listbox')).getByText('Le Petit Prince').closest('li')
    expect(active).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-activedescendant', 'demo-option-1')

    await user.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(ELEVES[1])
    expect(input).toHaveValue('')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('ignore Entrée tant qu\'aucune option n\'est active', async () => {
    const user = userEvent.setup()
    const { input, onChange } = rendreCombobox(ELEVES)

    await user.type(input, 'lea')
    await user.keyboard('{Enter}')

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeDefined()
  })

  it('ferme la liste au clic extérieur ; le clic sur une option sélectionne', async () => {
    const user = userEvent.setup()
    const { input, onChange } = rendreCombobox(ELEVES)

    await user.type(input, 'lea')
    await user.click(screen.getByText('Extérieur'))
    expect(screen.queryByRole('listbox')).toBeNull()

    // Le clic extérieur garde la saisie ('lea') : on vide avant de rouvrir.
    await user.clear(input)
    await user.type(input, 'lea')
    await user.click(within(screen.getByRole('listbox')).getByText('Léa Martin'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(ELEVES[0])
    expect(input).toHaveValue('')
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})