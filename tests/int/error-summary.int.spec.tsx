import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ErrorSummary } from '@/components/molecules/m-notifications'

describe('ErrorSummary (focus)', () => {
  it('prend le focus quand il apparait', () => {
    const { container } = render(<ErrorSummary errors={['Le nom est requis']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-m-error-summary'))
  })

  it('ne vole pas le focus aux re-renders suivants (saisie dans un champ)', () => {
    const { rerender, container } = render(
      <ErrorSummary errors={[{ fieldId: 'email', text: 'Email incorrect' }]} />,
    )
    const summary = container.querySelector('.lpv-m-error-summary') as HTMLElement
    expect(document.activeElement).toBe(summary)

    // L'utilisateur cliquera dans un champ : le focus n'est plus le summary
    const champ = document.createElement('input')
    document.body.appendChild(champ)
    champ.focus()
    expect(document.activeElement).toBe(champ)

    // Re-render avec le MEME texte (recree le tableau) : le focus ne doit pas revenir au summary
    rerender(<ErrorSummary errors={[{ fieldId: 'email', text: 'Email incorrect' }]} />)
    expect(document.activeElement).toBe(champ)
    expect(document.activeElement).not.toBe(container.querySelector('.lpv-m-error-summary'))
  })

  it('reprend le focus apres disparition puis reappearance (nouveau submit en echec)', () => {
    const { rerender, container } = render(<ErrorSummary errors={['Erreur A']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-m-error-summary'))

    // Soumission suivante : erreur effacee puis nouvelle erreur -> focus de nouveau legitime
    rerender(<ErrorSummary errors={[]} />)
    rerender(<ErrorSummary errors={['Erreur B']} />)
    expect(document.activeElement).toBe(container.querySelector('.lpv-m-error-summary'))
  })
})